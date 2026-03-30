import type { OcrAnalyzeResponse } from '@/types/api.types'

export interface ParsedItem {
  name: string
  price: number
  quantity: number
  confidence: 'high' | 'low'
}

export interface OcrResult {
  items: ParsedItem[]
  source: 'apple-vision' | 'google-vision'
  rawText: string
}

export type { OcrAnalyzeResponse }
