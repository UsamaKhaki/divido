/**
 * OcrFallbackService — backend Google Vision proxy (SRP: API call only).
 *
 * Sends a base64-encoded image to POST /api/v1/ocr/analyze and returns
 * the extracted text + confidence score. No parsing happens here.
 */

import { api } from '@/services/api'
import type { ApiResponse, OcrAnalyzeRequest, OcrAnalyzeResponse } from '@/types/api.types'

export const ocrFallbackService = {
  analyze: (image: string): Promise<OcrAnalyzeResponse> =>
    api
      .post<ApiResponse<OcrAnalyzeResponse>>('/ocr/analyze', {
        image,
      } satisfies OcrAnalyzeRequest)
      .then((r) => r.data.data),
}
