import { parseReceiptText } from '../receiptParser'

describe('parseReceiptText', () => {
  it('extracts name and price from simple item lines', () => {
    const items = parseReceiptText('Chicken Shawarma 18.50\nMint Lemonade 12.00')

    expect(items).toEqual([
      { name: 'Chicken Shawarma', price: 18.5, quantity: 1, confidence: 'high' },
      { name: 'Mint Lemonade', price: 12, quantity: 1, confidence: 'high' },
    ])
  })

  it('reads a leading "2x" or trailing "x2" quantity marker', () => {
    const items = parseReceiptText('2x Coffee 14.00\nCroissant x3 21.00')

    expect(items).toEqual([
      expect.objectContaining({ name: 'Coffee', quantity: 2, price: 14 }),
      expect.objectContaining({ name: 'Croissant', quantity: 3, price: 21 }),
    ])
  })

  it('skips totals, tax and payment lines', () => {
    const text = [
      'Burger 35.00',
      'Subtotal 35.00',
      'VAT 5% 1.75',
      'TOTAL 36.75',
      'Cash 50.00',
      'Change 13.25',
      'Thank you! Visit again 0.00',
    ].join('\n')

    expect(parseReceiptText(text).map((item) => item.name)).toEqual(['Burger'])
  })

  it('keeps items whose names merely contain a skip keyword', () => {
    const items = parseReceiptText('Cashew Chicken 32.00\nTaxi Voucher 20.00')

    expect(items.map((item) => item.name)).toEqual(['Cashew Chicken', 'Taxi Voucher'])
  })

  it('parses comma decimal separators', () => {
    expect(parseReceiptText('Espresso 3,50')[0]?.price).toBe(3.5)
  })

  it('parses thousands separators without splitting the amount', () => {
    const [item] = parseReceiptText('Hotel Night 1,234.56')

    expect(item).toEqual(expect.objectContaining({ name: 'Hotel Night', price: 1234.56 }))
  })

  it('strips a currency marker left next to the price', () => {
    const items = parseReceiptText('Falafel Wrap 9.00 AED\nLatte $4.50')

    expect(items.map((item) => item.name)).toEqual(['Falafel Wrap', 'Latte'])
  })

  it('ignores lines without a price and lines that are only a price', () => {
    expect(parseReceiptText('Table 12\n   \n45.00\nGuests: 4')).toEqual([])
  })

  it('returns an empty list for empty OCR output', () => {
    expect(parseReceiptText('')).toEqual([])
  })
})
