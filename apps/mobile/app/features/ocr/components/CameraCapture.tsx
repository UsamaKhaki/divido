/**
 * CameraCapture — camera UI component (SRP: capture only).
 *
 * Renders the camera view, requests permission, captures a compressed
 * JPEG image and emits its base64 string via onCapture. No OCR logic here.
 */

import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImageManipulator from 'expo-image-manipulator'
import { useRef } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

interface CameraCaptureProps {
  onCapture: (base64: string) => void
  onCancel: () => void
}

export const CameraCapture = ({ onCapture, onCancel }: CameraCaptureProps) => {
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<CameraView>(null)

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="white" />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-black px-6">
        <Text className="text-center text-base text-white">
          Camera access is required to scan receipts.
        </Text>
        <Pressable className="rounded-xl bg-white px-6 py-3" onPress={requestPermission}>
          {' '}
          <Text className="font-semibold text-black">Grant Permission</Text>
        </Pressable>
        <Pressable onPress={onCancel}>
          <Text className="text-sm text-neutral-400">Cancel</Text>
        </Pressable>
      </View>
    )
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return

    const photo = await cameraRef.current.takePictureAsync({ base64: false })
    if (!photo) return

    const compressed = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 800 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true },
    )

    if (compressed.base64) {
      onCapture(compressed.base64)
    }
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} className="flex-1" facing="back" />

      <View className="absolute bottom-10 w-full flex-row items-center justify-between px-10">
        <Pressable onPress={onCancel}>
          <Text className="text-base text-white">Cancel</Text>
        </Pressable>

        <Pressable
          className="h-16 w-16 rounded-full border-4 border-white bg-white/30"
          onPress={handleCapture}
        />

        {/* spacer */}
        <View className="w-12" />
      </View>
    </View>
  )
}
