<?php

namespace App\Actions\Expenses;

use App\DTOs\Expenses\ExpenseData;
use App\Exceptions\NotGroupMemberException;
use App\Models\Expense;
use App\Repositories\ExpenseRepository;
use App\Repositories\GroupRepository;

class CreateExpenseAction
{
    public function __construct(
        private readonly ExpenseRepository $expenseRepo,
        private readonly GroupRepository $groupRepo,
    ) {}

    public function execute(ExpenseData $data): Expense
    {
        $group = $this->groupRepo->findById($data->groupId);

        if (! $group || ! $this->groupRepo->isMember($group, $data->paidBy)) {
            throw new NotGroupMemberException;
        }

        $expense = $this->expenseRepo->create([
            'group_id' => $data->groupId,
            'paid_by' => $data->paidBy,
            'title' => $data->title,
            'total_amount' => $data->totalAmount,
            'category' => $data->category,
        ]);

        if (! empty($data->items)) {
            $this->expenseRepo->createItems($expense, $data->items);
        }

        return $expense->load(['paidBy', 'items']);
    }
}
