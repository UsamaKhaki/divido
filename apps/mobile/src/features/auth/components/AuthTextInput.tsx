import { Text, TextInput, View } from 'react-native'

interface AuthTextInputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  keyboardType?: 'default' | 'email-address'
  error?: string
  testID?: string
}

export const AuthTextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  error,
  testID,
}: AuthTextInputProps) => (
  <View className="mb-4">
    <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>
    <TextInput
      className={`min-h-[44px] rounded-xl border px-4 py-3 text-base text-gray-900 ${
        error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
      }`}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      autoCorrect={false}
      accessible
      accessibilityLabel={label}
      testID={testID}
    />
    {error ? (
      <Text className="mt-1 text-xs text-red-500" accessibilityRole="alert">
        {error}
      </Text>
    ) : null}
  </View>
)
