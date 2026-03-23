<?php

namespace App\Actions\Expenses;

use App\Exceptions\NotExpenseCreatorException;
use App\Models\Expense;
use App\Repositories\ExpenseRepository;

class DeleteExpenseAction
{
    public function __construct(private readonly ExpenseRepository $repo) {}

    public function execute(Expense $expense, int $userId): void
    {
        if ($expense->paid_by !== $userId) {
            throw new NotExpenseCreatorException();
        }

        $this->repo->delete($expense);
    }
}
