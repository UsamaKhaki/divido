<?php

namespace App\Repositories;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SuggestionsRepository
{
    /**
     * For each item name, count how many times each user was assigned that item
     * within the given group's expenses.
     *
     * Returns a flat collection of stdClass objects with:
     *   item_name, user_id, user_name, assignment_count
     *
     * @param  array<int, string> $itemNames
     */
    public function getAssignmentCounts(int $groupId, array $itemNames): Collection
    {
        $normalised = array_map('strtolower', $itemNames);

        return DB::table('item_splits')
            ->join('expense_items', 'item_splits.expense_item_id', '=', 'expense_items.id')
            ->join('expenses', 'expense_items.expense_id', '=', 'expenses.id')
            ->join('users', 'item_splits.user_id', '=', 'users.id')
            ->where('expenses.group_id', $groupId)
            ->whereIn(DB::raw('LOWER(expense_items.name)'), $normalised)
            ->select(
                'expense_items.name as item_name',
                'item_splits.user_id',
                'users.name as user_name',
                DB::raw('COUNT(*) as assignment_count'),
            )
            ->groupBy('expense_items.name', 'item_splits.user_id', 'users.name')
            ->orderBy('expense_items.name')
            ->orderByDesc('assignment_count')
            ->get();
    }
}
