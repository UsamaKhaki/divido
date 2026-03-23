import { View } from 'react-native'

interface SkeletonBarProps {
  className?: string
}

const SkeletonBar = ({ className = '' }: SkeletonBarProps) => (
  <View className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
)

/** Card-shaped loading skeleton. Renders 4 placeholder rows. */
export const LoadingSkeleton = () => (
  <View className="flex-1 bg-white px-4 pt-4">
    {[0, 1, 2, 3].map((i) => (
      <View key={i} className="mb-3 rounded-2xl border border-gray-100 bg-white p-4">
        <SkeletonBar className="mb-2 h-4 w-3/5" />
        <SkeletonBar className="h-3 w-2/5" />
      </View>
    ))}
  </View>
)
