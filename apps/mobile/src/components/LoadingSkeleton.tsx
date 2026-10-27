import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

interface SkeletonBarProps {
  opacity: Animated.Value
  className?: string
}

const SkeletonBar = ({ opacity, className = '' }: SkeletonBarProps) => (
  <Animated.View style={{ opacity }} className={`rounded-lg bg-gray-200 ${className}`} />
)

/** Card-shaped loading skeleton. Renders 4 placeholder rows. */
export const LoadingSkeleton = () => {
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    )
    pulse.start()
    return () => pulse.stop()
  }, [opacity])

  return (
    <View className="flex-1 bg-white px-4 pt-4">
      {[0, 1, 2, 3].map((i) => (
        <View key={i} className="mb-3 rounded-2xl border border-gray-100 bg-white p-4">
          <SkeletonBar opacity={opacity} className="mb-2 h-4 w-3/5" />
          <SkeletonBar opacity={opacity} className="h-3 w-2/5" />
        </View>
      ))}
    </View>
  )
}
