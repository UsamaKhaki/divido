/**
 * OcrService — Apple Vision on-device OCR (SRP: native module call only).
 *
 * On physical iOS devices this wraps the native VNRecognizeTextRequest.
 * In development / Android it returns a low-confidence stub so the hook
 * automatically falls back to the Google Vision backend route.
 */

export const ocrService = {
  recognize: async (_imageBase64: string): Promise<{ text: string; confidence: number }> => {
    // Apple Vision is a native iOS module. In Expo Managed workflow it is
    // accessed via a custom native module or expo-modules-core extension.
    // Until that native layer is wired up, we return a stub that always
    // triggers the fallback so the rest of the pipeline can be exercised.
    return { text: '', confidence: 0 }
  },
}
