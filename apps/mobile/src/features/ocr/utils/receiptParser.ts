/**
 * ReceiptParser — text → ParsedItem[] (SRP: parsing only).
 *
 * Converts raw OCR text from either Apple Vision or Google Vision into
 * a structured list of items with names, prices, and quantities.
 * Lines matching skip keywords (totals, taxes, etc.) are discarded.
 */

import type { ParsedItem } from '../types/ocr.types'

// Either a thousands-separated amount ("1,234.56") or a plain amount with a
// dot or comma decimal separator ("12.50", "12,50"). The lookahead stops
// "1,234.56" from being read as "1,23".
const PRICE_PATTERN = /(\d{1,3}(?:,\d{3})+\.\d{2}|\d{1,6}[.,]\d{2})(?!\d)/
const QTY_PATTERN = /^(\d+)[xX]\s+|[xX](\d+)$/
const TRAILING_CURRENCY_PATTERN = /\s*(?:[$€£]|AED|USD|EUR|GBP)$/i

// Whole words only, so items like "Cashew nuts" or "Taxi" are not dropped
// because they contain "cash" or "tax".
const SKIP_PATTERN = /\b(?:total|subtotal|tax|taxes|vat|discount|change|cash|receipt|thanks?)\b/i

const parsePrice = (raw: string): number => {
  const normalised = raw.includes('.') ? raw.replace(/,/g, '') : raw.replace(',', '.')
  return parseFloat(normalised)
}

export const parseReceiptText = (rawText: string): ParsedItem[] => {
  return rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !SKIP_PATTERN.test(line))
    .reduce<ParsedItem[]>((items, line) => {
      const priceMatch = line.match(PRICE_PATTERN)
      if (!priceMatch) return items

      const price = parsePrice(priceMatch[1])
      const name = line.replace(priceMatch[0], '').replace(TRAILING_CURRENCY_PATTERN, '').trim()
      const qtyMatch = name.match(QTY_PATTERN)
      const quantity = qtyMatch ? parseInt(qtyMatch[1] ?? qtyMatch[2] ?? '1', 10) : 1
      const cleanName = name.replace(QTY_PATTERN, '').trim()

      if (!cleanName) return items

      items.push({ name: cleanName, price, quantity, confidence: 'high' })
      return items
    }, [])
}
