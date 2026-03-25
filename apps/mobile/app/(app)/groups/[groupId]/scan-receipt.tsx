/**
 * ScanReceiptScreen — full-screen camera for receipt capture.
 *
 * Renders CameraCapture, triggers the OCR scan pipeline via useOcrScan,
 * then navigates to review-receipt with the parsed items.
 * SRP: screen composition + navigation only.
 */

import { router, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'

import { CameraCapture, useOcrScan } from '@/features/ocr'
import type { ParsedItem } from '@/features/ocr'

export default function ScanReceiptScreen() {
  const { groupId: groupIdParam } = useLocalSearchParams<{ groupId: string }>()
  const groupId = Number(groupIdParam)

  const { scan, isScanning, error } = useOcrScan()

  const handleCapture = async (base64: string) => {
    const result = await scan(base64)

    if (!result) return // error state handled by useOcrScan

    const items: ParsedItem[] = result.items.length > 0 ? result.items : []

    router.replace({
      pathname: '/(app)/groups/[groupId]/review-receipt',
      params: {
        groupId: String(groupId),
        items: JSON.stringify(items),
        source: result.source,
      },
    })
  }

  const handleCancel = () => {
    router.back()
  }

  if (isScanning) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-black">
        <ActivityIndicator color="white" size="large" />
        <Text className="text-base text-white">Scanning receipt…</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-black">
      <CameraCapture onCapture={handleCapture} onCancel={handleCancel} />

      {error ? (
        <View className="absolute bottom-32 left-6 right-6 rounded-xl bg-red-600 px-4 py-3">
          <Text className="text-center text-sm text-white">{error}</Text>
        </View>
      ) : null}
    </View>
  )
}
