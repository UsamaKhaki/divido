/**
 * ReceiptParser — text → ParsedItem[] (SRP: parsing only).
 *
 * Converts raw OCR text from either Apple Vision or Google Vision into
 * a structured list of items with names, prices, and quantities.
 * Lines matching skip keywords (totals, taxes, etc.) are discarded.
 */

import type { ParsedItem } from '../types/ocr.types'

const PRICE_PATTERN = /(\d{1,6}[.,]\d{2})/
const QTY_PATTERN = /^(\d+)[xX]\s+|[xX](\d+)$/
const SKIP_KEYWORDS = [
  'total',
  'subtotal',
  'tax',
  'vat',
  'discount',
  'change',
  'cash',
  'receipt',
  'thank',
]

export const parseReceiptText = (rawText: string): ParsedItem[] => {
  return rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !SKIP_KEYWORDS.some((kw) => line.toLowerCase().includes(kw)))
    .reduce<ParsedItem[]>((items, line) => {
      const priceMatch = line.match(PRICE_PATTERN)
      if (!priceMatch) return items

      const price = parseFloat(priceMatch[1].replace(',', '.'))
      const name = line.replace(priceMatch[0], '').trim()
      const qtyMatch = name.match(QTY_PATTERN)
      const quantity = qtyMatch ? parseInt(qtyMatch[1] ?? qtyMatch[2] ?? '1') : 1
      const cleanName = name.replace(QTY_PATTERN, '').trim()

      if (!cleanName) return items

      items.push({ name: cleanName, price, quantity, confidence: 'high' })
      return items
    }, [])
}
