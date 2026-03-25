/**
 * useOcrScan — OCR orchestration hook (SRP: flow coordination only).
 *
 * Coordinates: capture → Apple Vision → confidence check → fallback → parse.
 * Does not do any OCR itself — delegates to services and parser.
 */

import { useCallback, useState } from 'react'

import { ocrFallbackService } from '../services/ocrFallbackService'
import { ocrService } from '../services/ocrService'
import type { OcrResult } from '../types/ocr.types'
import { parseReceiptText } from '../utils/receiptParser'

const CONFIDENCE_THRESHOLD = 0.75

export const useOcrScan = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scan = useCallback(async (imageBase64: string): Promise<OcrResult | null> => {
    setIsScanning(true)
    setError(null)

    try {
      const { text, confidence } = await ocrService.recognize(imageBase64)

      let finalText = text
      let source: OcrResult['source'] = 'apple-vision'

      if (confidence < CONFIDENCE_THRESHOLD) {
        const fallback = await ocrFallbackService.analyze(imageBase64)
        finalText = fallback.text
        source = 'google-vision'
      }

      return { items: parseReceiptText(finalText), source, rawText: finalText }
    } catch {
      setError('Receipt scan failed. Please try again or enter manually.')
      return null
    } finally {
      setIsScanning(false)
    }
  }, [])

  return { scan, isScanning, error }
}
