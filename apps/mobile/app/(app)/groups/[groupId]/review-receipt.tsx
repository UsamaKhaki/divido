/**
 * ReviewReceiptScreen — let the user inspect and correct OCR-parsed items
 * before moving on to the expense creation form.
 *
 * SRP: editable item list + navigation hand-off only.
 * No OCR calls here — items arrive pre-parsed via route params.
 */

import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'

import type { ParsedItem } from '@/features/ocr'

// ─── Editable item row ────────────────────────────────────────────────────────

interface EditableItemRowProps {
  item: ParsedItem & { id: number }
  onChangeName: (id: number, value: string) => void
  onChangePrice: (id: number, value: string) => void
  onChangeQuantity: (id: number, value: string) => void
  onDelete: (id: number) => void
}

const EditableItemRow = ({
  item,
  onChangeName,
  onChangePrice,
  onChangeQuantity,
  onDelete,
}: EditableItemRowProps) => (
  <View className="mb-3 rounded-2xl border border-gray-100 bg-white p-4">
    <View className="mb-2 flex-row items-center justify-between">
      <TextInput
        className="flex-1 text-base font-medium text-gray-900"
        value={item.name}
        onChangeText={(v) => onChangeName(item.id, v)}
        placeholder="Item name"
        placeholderTextColor="#9ca3af"
        accessibilityLabel={`Item name for row ${item.id}`}
      />
      <Pressable
        className="ml-3 min-h-[36px] min-w-[36px] items-center justify-center rounded-xl bg-red-50"
        onPress={() => onDelete(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.name}`}
      >
        <Text className="text-sm font-semibold text-red-500">✕</Text>
      </Pressable>
    </View>

    <View className="flex-row gap-3">
      <View className="flex-1">
        <Text className="mb-1 text-xs font-medium text-gray-500">Price</Text>
        <TextInput
          className="min-h-[40px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
          value={String(item.price)}
          onChangeText={(v) => onChangePrice(item.id, v)}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#9ca3af"
          accessibilityLabel={`Price for ${item.name}`}
        />
      </View>
      <View className="w-24">
        <Text className="mb-1 text-xs font-medium text-gray-500">Qty</Text>
        <TextInput
          className="min-h-[40px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
          value={String(item.quantity)}
          onChangeText={(v) => onChangeQuantity(item.id, v)}
          keyboardType="number-pad"
          placeholder="1"
          placeholderTextColor="#9ca3af"
          accessibilityLabel={`Quantity for ${item.name}`}
        />
      </View>
    </View>

    <Text className="mt-2 text-xs text-gray-400">
      Subtotal: PKR {(item.price * item.quantity).toFixed(2)}
      {item.confidence === 'low' ? <Text className="text-amber-500"> · Low confidence</Text> : null}
    </Text>
  </View>
)

// ─── Screen ─────────────────────────────────────────────────────────────────

type RowItem = ParsedItem & { id: number }

export default function ReviewReceiptScreen() {
  const {
    groupId: groupIdParam,
    items: itemsParam,
    source,
  } = useLocalSearchParams<{
    groupId: string
    items: string
    source: string
  }>()

  const groupId = Number(groupIdParam)

  const initialItems = (): RowItem[] => {
    try {
      const parsed = JSON.parse(itemsParam ?? '[]') as ParsedItem[]
      return parsed.map((item, i) => ({ ...item, id: i + 1 }))
    } catch {
      return []
    }
  }

  const [items, setItems] = useState<RowItem[]>(initialItems)
  const [nextId, setNextId] = useState(items.length + 1)

  const handleChangeName = useCallback((id: number, value: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, name: value } : it)))
  }, [])

  const handleChangePrice = useCallback((id: number, value: string) => {
    const price = parseFloat(value)
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, price: isNaN(price) ? 0 : price } : it)),
    )
  }, [])

  const handleChangeQuantity = useCallback((id: number, value: string) => {
    const qty = parseInt(value, 10)
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: isNaN(qty) || qty < 1 ? 1 : qty } : it)),
    )
  }, [])

  const handleDelete = useCallback((id: number) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }, [])

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: nextId, name: '', price: 0, quantity: 1, confidence: 'high' },
    ])
    setNextId((n) => n + 1)
  }

  const handleConfirm = () => {
    const validItems = items.filter((it) => it.name.trim().length > 0 && it.price > 0)

    router.push({
      pathname: '/(app)/groups/[groupId]/add-expense',
      params: {
        groupId: String(groupId),
        items: JSON.stringify(
          validItems.map(({ name, price, quantity }) => ({ name, price, quantity })),
        ),
      },
    })
  }

  const sourceBadge = source === 'apple-vision' ? '🍎 Apple Vision' : '☁️ Google Vision'
  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0)

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header row */}
      <View className="flex-row items-center justify-between bg-white px-6 py-4">
        <View>
          <Text className="text-xs font-medium text-gray-400">{sourceBadge}</Text>
          <Text className="text-sm font-semibold text-gray-700">
            {items.length} item{items.length !== 1 ? 's' : ''} · PKR {total.toFixed(2)}
          </Text>
        </View>
        <Pressable
          className="min-h-[44px] items-center justify-center rounded-xl bg-blue-600 px-5"
          onPress={handleConfirm}
          disabled={items.length === 0}
          accessibilityRole="button"
          accessibilityLabel="Use these items"
        >
          <Text className="text-sm font-semibold text-white">Use these items →</Text>
        </Pressable>
      </View>

      {/* Empty state */}
      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-center text-base font-semibold text-gray-700">
            No items detected
          </Text>
          <Text className="text-center text-sm text-gray-400">
            Add items manually below or go back and re-scan with better lighting.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-5 pt-4 pb-32" keyboardShouldPersistTaps="handled">
          {items.map((item) => (
            <EditableItemRow
              key={item.id}
              item={item}
              onChangeName={handleChangeName}
              onChangePrice={handleChangePrice}
              onChangeQuantity={handleChangeQuantity}
              onDelete={handleDelete}
            />
          ))}
        </ScrollView>
      )}

      {/* Sticky add button */}
      <View className="absolute bottom-8 left-5 right-5">
        <Pressable
          className="min-h-[48px] items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-white"
          onPress={handleAddItem}
          accessibilityRole="button"
          accessibilityLabel="Add item manually"
        >
          <Text className="text-sm font-semibold text-blue-600">+ Add item manually</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}
