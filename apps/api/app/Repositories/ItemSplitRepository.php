<?php

namespace App\Repositories;

use App\Models\ExpenseItem;
use App\Models\ItemSplit;
use Illuminate\Database\Eloquent\Collection;

class ItemSplitRepository
{
    /**
     * Replace all splits for an item with the given set.
     *
     * @param array<int, array{user_id: int, amount: float}> $splits
     */
    public function replaceSplitsForItem(ExpenseItem $item, array $splits): void
    {
        $item->splits()->delete();

        foreach ($splits as $split) {
            $item->splits()->create([
                'user_id' => $split['user_id'],
                'amount'  => $split['amount'],
            ]);
        }
    }

    public function getSplitsForItem(int $itemId): Collection
    {
        return ItemSplit::with('user')
            ->where('expense_item_id', $itemId)
            ->get();
    }

    /**
     * Get all splits across a group's expenses, with their payer info.
     *
     * @return Collection<int, ItemSplit>
     */
    public function getForGroup(int $groupId): Collection
    {
        return ItemSplit::with(['user', 'expenseItem.expense'])
            ->whereHas('expenseItem.expense', fn ($q) => $q->where('group_id', $groupId))
            ->get();
    }
}
