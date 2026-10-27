<?php

namespace App\Actions\Expenses;

use App\Exceptions\NotExpenseCreatorException;
use App\Models\Expense;
use App\Repositories\ExpenseRepository;
use Illuminate\Support\Facades\DB;

class DeleteExpenseAction
{
    public function __construct(
        private readonly ExpenseRepository $repo,
        private readonly RegenerateGroupSettlementsAction $regenerate,
    ) {}

    public function execute(Expense $expense, int $userId): void
    {
        if ($expense->paid_by !== $userId) {
            throw new NotExpenseCreatorException;
        }

        // Deleting an expense cascades to its splits, so the pending
        // settlement plan has to be rebuilt in the same transaction.
        DB::transaction(function () use ($expense) {
            $this->repo->delete($expense);
            $this->regenerate->execute($expense->group_id);
        });
    }
}
