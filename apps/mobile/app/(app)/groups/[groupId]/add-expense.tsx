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
import { useGroupSuggestionsQuery } from '@/features/suggestions/hooks/useGroupSuggestionsQuery'
import type { CreateExpenseItemRequest, ExpenseCategory } from '@/types/api.types'

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'food', label: '🍔 Food' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'accommodation', label: '🏠 Stay' },
  { value: 'entertainment', label: '🎉 Fun' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'other', label: '📦 Other' },
]

type RowItem = CreateExpenseItemRequest & { rowId: number }

const parseItemsParam = (param: string | undefined): RowItem[] => {
  if (!param) return []
  try {
    const parsed = JSON.parse(param) as CreateExpenseItemRequest[]
    return parsed.map((it, i) => ({ ...it, rowId: i + 1 }))
  } catch {
    return []
  }
}

export default function AddExpenseScreen() {
  const { groupId: groupIdParam, items: itemsParam } = useLocalSearchParams<{
    groupId: string
    items?: string
  }>()
  const groupId = Number(groupIdParam)

  const [title, setTitle] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory | undefined>()
  const [items, setItems] = useState<RowItem[]>(() => parseItemsParam(itemsParam))
  const [nextRowId, setNextRowId] = useState(items.length + 1)

  const { mutate: create, isPending, error } = useCreateExpenseMutation()

  const filledItemNames = items.map((it) => it.name.trim()).filter((n) => n.length >= 2)
  const { data: suggestions } = useGroupSuggestionsQuery(groupId, filledItemNames)

  const getSuggestionHint = (name: string): string | null => {
    const match = suggestions?.find((s) => s.item_name.toLowerCase() === name.trim().toLowerCase())
    if (!match || match.suggested_users.length === 0) return null
    const names = match.suggested_users.slice(0, 3).map((su) => su.user.name.split(' ')[0])
    return `Usually: ${names.join(', ')}`
  }

  const apiErrors = error?.errors
  const generalError = !apiErrors && error?.message ? error.message : undefined

  const handleAddItem = () => {
    setItems((prev) => [...prev, { rowId: nextRowId, name: '', price: 0, quantity: 1 }])
    setNextRowId((n) => n + 1)
  }

  const handleDeleteItem = (rowId: number) => {
    setItems((prev) => prev.filter((it) => it.rowId !== rowId))
  }

  const handleItemChange = (rowId: number, field: keyof CreateExpenseItemRequest, raw: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.rowId !== rowId) return it
        if (field === 'name') return { ...it, name: raw }
        if (field === 'price') {
          const v = parseFloat(raw)
          return { ...it, price: isNaN(v) ? 0 : v }
        }
        if (field === 'quantity') {
          const v = parseInt(raw, 10)
          return { ...it, quantity: isNaN(v) || v < 1 ? 1 : v }
        }
        return it
      }),
    )
  }

  const handleSubmit = () => {
    const amount = parseFloat(totalAmount)
    if (!title.trim() || isNaN(amount) || amount <= 0) return

    const validItems = items.filter((it) => it.name.trim().length > 0 && it.price > 0)

    create(
      {
        group_id: groupId,
        title: title.trim(),
        total_amount: amount,
        category,
        items:
          validItems.length > 0
            ? validItems.map(({ name, price, quantity }) => ({ name, price, quantity }))
            : undefined,
      },
      {
        onSuccess: () => {
          // A web reload or deep link leaves no history to go back to.
          if (router.canGoBack()) {
            router.back()
          } else {
            router.replace({
              pathname: '/(app)/groups/[groupId]',
              params: { groupId: String(groupId) },
            })
          }
        },
      },
    )
  }

  const handleScanReceipt = () => {
    router.push({
      pathname: '/(app)/groups/[groupId]/scan-receipt',
      params: { groupId: String(groupId) },
    })
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

        {/* Scan Receipt shortcut */}
        <Pressable
          className="mb-6 min-h-[48px] flex-row items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50"
          onPress={handleScanReceipt}
          accessibilityRole="button"
          accessibilityLabel="Scan a receipt"
        >
          <Text className="text-base">📷</Text>
          <Text className="text-sm font-semibold text-blue-700">Scan receipt with camera</Text>
        </Pressable>

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

        {/* Items */}
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-gray-700">
            Items <Text className="font-normal text-gray-400">(optional)</Text>
          </Text>
          {items.length > 0 ? (
            <Text className="text-xs text-gray-400">{items.length} added</Text>
          ) : null}
        </View>

        {items.map((item) => (
          <View key={item.rowId} className="mb-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <View className="mb-2 flex-row items-center gap-2">
              <View className="flex-1">
                <TextInput
                  className="min-h-[40px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                  value={item.name}
                  onChangeText={(v) => handleItemChange(item.rowId, 'name', v)}
                  placeholder="Item name"
                  placeholderTextColor="#9ca3af"
                  accessibilityLabel={`Item name row ${item.rowId}`}
                />
                {getSuggestionHint(item.name) ? (
                  <Text className="mt-1 text-xs text-blue-500">{getSuggestionHint(item.name)}</Text>
                ) : null}
              </View>
              <Pressable
                className="min-h-[40px] min-w-[40px] items-center justify-center rounded-xl bg-red-50"
                onPress={() => handleDeleteItem(item.rowId)}
                accessibilityRole="button"
                accessibilityLabel={`Remove item ${item.name || item.rowId}`}
              >
                <Text className="text-sm text-red-500">✕</Text>
              </Pressable>
            </View>
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 min-h-[40px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                value={item.price > 0 ? String(item.price) : ''}
                onChangeText={(v) => handleItemChange(item.rowId, 'price', v)}
                placeholder="Price"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                accessibilityLabel={`Price for item ${item.rowId}`}
              />
              <TextInput
                className="w-20 min-h-[40px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                value={String(item.quantity)}
                onChangeText={(v) => handleItemChange(item.rowId, 'quantity', v)}
                placeholder="Qty"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                accessibilityLabel={`Quantity for item ${item.rowId}`}
              />
            </View>
          </View>
        ))}

        <Pressable
          className="mb-6 min-h-[44px] items-center justify-center rounded-xl border border-dashed border-gray-300"
          onPress={handleAddItem}
          accessibilityRole="button"
          accessibilityLabel="Add item"
        >
          <Text className="text-sm font-medium text-gray-500">+ Add item</Text>
        </Pressable>

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
