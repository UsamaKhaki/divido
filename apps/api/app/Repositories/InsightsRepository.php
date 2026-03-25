<?php

namespace App\Repositories;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InsightsRepository
{
    /**
     * Sum of item_splits amounts per user for all expenses in the group.
     *
     * Returns collection of stdClass: user_id, user_name, total
     */
    public function getSpentPerUser(int $groupId): Collection
    {
        return DB::table('item_splits')
            ->join('expense_items', 'item_splits.expense_item_id', '=', 'expense_items.id')
            ->join('expenses', 'expense_items.expense_id', '=', 'expenses.id')
            ->join('users', 'item_splits.user_id', '=', 'users.id')
            ->where('expenses.group_id', $groupId)
            ->select(
                'item_splits.user_id',
                'users.name as user_name',
                DB::raw('SUM(item_splits.amount) as total'),
            )
            ->groupBy('item_splits.user_id', 'users.name')
            ->orderByDesc('total')
            ->get();
    }

    /**
     * Sum of expense total_amounts per category for the group.
     *
     * Returns collection of stdClass: category, total
     */
    public function getCategoryBreakdown(int $groupId): Collection
    {
        return DB::table('expenses')
            ->where('group_id', $groupId)
            ->whereNotNull('category')
            ->select(
                'category',
                DB::raw('SUM(total_amount) as total'),
            )
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();
    }

    /**
     * Total of all expense amounts for the group.
     */
    public function getTotalGroupSpend(int $groupId): float
    {
        return (float) DB::table('expenses')
            ->where('group_id', $groupId)
            ->sum('total_amount');
    }
}
