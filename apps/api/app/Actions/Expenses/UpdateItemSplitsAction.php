<?php

namespace App\Actions\Expenses;

use App\DTOs\Expenses\SplitData;
use App\Exceptions\ExpenseItemNotFoundException;
use App\Exceptions\InvalidSplitAmountException;
use App\Models\ExpenseItem;
use App\Repositories\ItemSplitRepository;
use App\Repositories\SettlementRepository;

class UpdateItemSplitsAction
{
    public function __construct(
        private ItemSplitRepository $splitRepo,
        private SettlementRepository $settlementRepo,
        private RegenerateGroupSettlementsAction $regenerate,
    ) {}

    public function execute(SplitData $data): ExpenseItem
    {
        $item = ExpenseItem::with('expense')->find($data->expenseItemId);

        if (! $item) {
            throw new ExpenseItemNotFoundException;
        }

        $itemTotal = round((float) $item->price * $item->quantity, 2);
        $splitTotal = round(array_sum(array_column($data->splits, 'amount')), 2);

        if (abs($itemTotal - $splitTotal) > 0.01) {
            throw new InvalidSplitAmountException(
                "Split amounts ({$splitTotal}) must equal item total ({$itemTotal}).",
            );
        }

        $this->splitRepo->replaceSplitsForItem($item, $data->splits);

        $groupId = $item->expense->group_id;
        $this->regenerate->execute($groupId);

        return $item->load('splits.user');
    }
}
