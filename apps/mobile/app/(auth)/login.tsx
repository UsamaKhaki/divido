import { Link } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'

import { AuthTextInput } from '@/features/auth/components/AuthTextInput'
import { useLoginMutation } from '@/features/auth/hooks/useLoginMutation'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { mutate: login, isPending, error } = useLoginMutation()

  const apiErrors = error?.errors
  const generalError = !apiErrors && error?.message ? error.message : undefined

  const handleSubmit = () => {
    login({ email: email.trim(), password })
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-2 text-3xl font-bold text-gray-900">Welcome back</Text>
        <Text className="mb-8 text-base text-gray-500">Sign in to your Divido account</Text>

        {generalError ? (
          <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm text-red-600">{generalError}</Text>
          </View>
        ) : null}

        <AuthTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          error={apiErrors?.email?.[0]}
        />
        <AuthTextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          error={apiErrors?.password?.[0]}
        />

        <Pressable
          className="mt-2 min-h-[48px] items-center justify-center rounded-xl bg-blue-600 px-6"
          onPress={handleSubmit}
          disabled={isPending}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">Sign in</Text>
          )}
        </Pressable>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-gray-500">Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel="Register">
              <Text className="text-sm font-semibold text-blue-600">Register</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
