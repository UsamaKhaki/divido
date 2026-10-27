<?php

namespace App\Actions\Expenses;

use App\DTOs\Expenses\SplitData;
use App\Exceptions\ExpenseItemNotFoundException;
use App\Exceptions\InvalidSplitAmountException;
use App\Models\ExpenseItem;
use App\Repositories\ItemSplitRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateItemSplitsAction
{
    public function __construct(
        private ItemSplitRepository $splitRepo,
        private RegenerateGroupSettlementsAction $regenerate,
    ) {}

    public function execute(SplitData $data): ExpenseItem
    {
        $item = ExpenseItem::with('expense.group')->find($data->expenseItemId);

        // The request only authorises the expense in the URL, so an item from
        // another expense (possibly another group) must be treated as missing.
        if (! $item || (int) $item->expense_id !== $data->expenseId) {
            throw new ExpenseItemNotFoundException;
        }

        $itemTotal = round((float) $item->price * $item->quantity, 2);
        $splitTotal = round(array_sum(array_column($data->splits, 'amount')), 2);

        if (abs($itemTotal - $splitTotal) > 0.01) {
            throw new InvalidSplitAmountException(
                "Split amounts ({$splitTotal}) must equal item total ({$itemTotal}).",
            );
        }

        $memberIds = $item->expense->group->members()->pluck('users.id')->map(fn ($id) => (int) $id);

        foreach ($data->splits as $split) {
            if (! $memberIds->contains((int) $split['user_id'])) {
                throw ValidationException::withMessages([
                    'splits' => 'Every split must be assigned to a member of the group.',
                ]);
            }
        }

        DB::transaction(function () use ($item, $data) {
            $this->splitRepo->replaceSplitsForItem($item, $data->splits);
            $this->regenerate->execute($item->expense->group_id);
        });

        return $item->load('splits.user');
    }
}
