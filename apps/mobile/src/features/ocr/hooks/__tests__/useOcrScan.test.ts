/**
 * Covers the low-confidence fallback: on-device text below the confidence
 * threshold must be replaced by the backend (Google Vision) result.
 */
import { act, renderHook } from '@testing-library/react-native'

import { ocrFallbackService } from '../../services/ocrFallbackService'
import { ocrService } from '../../services/ocrService'
import { useOcrScan } from '../useOcrScan'

jest.mock('../../services/ocrService', () => ({
  ocrService: { recognize: jest.fn() },
}))
jest.mock('../../services/ocrFallbackService', () => ({
  ocrFallbackService: { analyze: jest.fn() },
}))

const recognize = jest.mocked(ocrService.recognize)
const analyze = jest.mocked(ocrFallbackService.analyze)

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useOcrScan', () => {
  it('uses the on-device result when confidence meets the threshold', async () => {
    recognize.mockResolvedValue({ text: 'Pizza 40.00', confidence: 0.9 })
    const { result } = renderHook(() => useOcrScan())

    let scan: Awaited<ReturnType<typeof result.current.scan>> = null
    await act(async () => {
      scan = await result.current.scan('base64-image')
    })

    expect(analyze).not.toHaveBeenCalled()
    expect(scan).toEqual({
      source: 'apple-vision',
      rawText: 'Pizza 40.00',
      items: [{ name: 'Pizza', price: 40, quantity: 1, confidence: 'high' }],
    })
  })

  it('falls back to Google Vision when on-device confidence is low', async () => {
    recognize.mockResolvedValue({ text: 'P1zz@', confidence: 0.4 })
    analyze.mockResolvedValue({ text: 'Pizza 40.00\nCola 6.00', confidence: 0.98 })
    const { result } = renderHook(() => useOcrScan())

    let scan: Awaited<ReturnType<typeof result.current.scan>> = null
    await act(async () => {
      scan = await result.current.scan('base64-image')
    })

    expect(analyze).toHaveBeenCalledWith('base64-image')
    expect(scan).toEqual(
      expect.objectContaining({
        source: 'google-vision',
        rawText: 'Pizza 40.00\nCola 6.00',
      }),
    )
  })

  it('returns null and exposes an error when the fallback request fails', async () => {
    recognize.mockResolvedValue({ text: '', confidence: 0 })
    analyze.mockRejectedValue(new Error('Network Error'))
    const { result } = renderHook(() => useOcrScan())

    let scan: Awaited<ReturnType<typeof result.current.scan>> = null
    await act(async () => {
      scan = await result.current.scan('base64-image')
    })

    expect(scan).toBeNull()
    expect(result.current.error).toBe('Receipt scan failed. Please try again or enter manually.')
    expect(result.current.isScanning).toBe(false)
  })
})
