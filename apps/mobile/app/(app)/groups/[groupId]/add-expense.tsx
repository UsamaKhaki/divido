import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'

import { useCreateExpenseMutation } from '@/features/expenses/hooks/useCreateExpenseMutation'
import type { ExpenseCategory } from '@/types/api.types'

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'food', label: '🍔 Food' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'accommodation', label: '🏠 Stay' },
  { value: 'entertainment', label: '🎉 Fun' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'other', label: '📦 Other' },
]

export default function AddExpenseScreen() {
  const { groupId: groupIdParam } = useLocalSearchParams<{ groupId: string }>()
  const groupId = Number(groupIdParam)

  const [title, setTitle] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory | undefined>()

  const { mutate: create, isPending, error } = useCreateExpenseMutation()

  const apiErrors = error?.errors
  const generalError = !apiErrors && error?.message ? error.message : undefined

  const handleSubmit = () => {
    const amount = parseFloat(totalAmount)
    if (!title.trim() || isNaN(amount) || amount <= 0) return

    create(
      {
        group_id: groupId,
        title: title.trim(),
        total_amount: amount,
        category,
      },
      {
        onSuccess: () => {
          router.back()
        },
      },
    )
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerClassName="px-6 py-6" keyboardShouldPersistTaps="handled">
        {generalError ? (
          <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm text-red-600">{generalError}</Text>
          </View>
        ) : null}

        {/* Title */}
        <Text className="mb-1 text-sm font-medium text-gray-700">What was it for?</Text>
        <TextInput
          className={`mb-4 min-h-[44px] rounded-xl border px-4 py-3 text-base text-gray-900 ${
            apiErrors?.title ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
          }`}
          placeholder="e.g. Dinner at Kolachi"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
          autoCapitalize="sentences"
          accessible
          accessibilityLabel="Expense title"
        />
        {apiErrors?.title ? (
          <Text className="-mt-3 mb-3 text-xs text-red-500">{apiErrors.title[0]}</Text>
        ) : null}

        {/* Amount */}
        <Text className="mb-1 text-sm font-medium text-gray-700">Total amount</Text>
        <TextInput
          className={`mb-4 min-h-[44px] rounded-xl border px-4 py-3 text-base text-gray-900 ${
            apiErrors?.total_amount ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
          }`}
          placeholder="0.00"
          placeholderTextColor="#9ca3af"
          value={totalAmount}
          onChangeText={setTotalAmount}
          keyboardType="decimal-pad"
          accessible
          accessibilityLabel="Total amount"
        />
        {apiErrors?.total_amount ? (
          <Text className="-mt-3 mb-3 text-xs text-red-500">{apiErrors.total_amount[0]}</Text>
        ) : null}

        {/* Category */}
        <Text className="mb-2 text-sm font-medium text-gray-700">
          Category <Text className="font-normal text-gray-400">(optional)</Text>
        </Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.value}
              className={`min-h-[36px] rounded-full border px-4 py-1.5 ${
                category === cat.value ? 'border-blue-600 bg-blue-600' : 'border-gray-200 bg-white'
              }`}
              onPress={() => setCategory(category === cat.value ? undefined : cat.value)}
              accessibilityRole="button"
              accessibilityLabel={`Category ${cat.label}`}
              accessibilityState={{ selected: category === cat.value }}
            >
              <Text
                className={`text-sm font-medium ${
                  category === cat.value ? 'text-white' : 'text-gray-700'
                }`}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          className="min-h-[48px] items-center justify-center rounded-xl bg-blue-600"
          onPress={handleSubmit}
          disabled={isPending}
          accessibilityRole="button"
          accessibilityLabel="Save expense"
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">Save expense</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
