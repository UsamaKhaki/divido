<?php

namespace App\Repositories;

use App\Models\Expense;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ExpenseRepository
{
    public function findByGroupPaginated(int $groupId, int $perPage = 15): LengthAwarePaginator
    {
        return Expense::where('group_id', $groupId)
            ->with(['paidBy'])
            ->latest()
            ->paginate($perPage);
    }

    public function create(array $data): Expense
    {
        return Expense::create($data);
    }

    public function createItems(Expense $expense, array $items): void
    {
        $expense->items()->createMany($items);
    }

    public function findById(int $id): ?Expense
    {
        return Expense::with(['paidBy', 'items'])->find($id);
    }

    public function delete(Expense $expense): void
    {
        $expense->delete();
    }
}
