<?php

namespace App\DTOs\Expenses;

use App\Http\Requests\Expenses\UpdateItemSplitsRequest;

class SplitData
{
    /**
     * @param array<int, array{user_id: int, amount: float}> $splits
     */
    public function __construct(
        public readonly int $expenseId,
        public readonly int $expenseItemId,
        public readonly array $splits,
    ) {}

    public static function fromRequest(UpdateItemSplitsRequest $request, int $expenseId, int $itemId): self
    {
        return new self(
            expenseId: $expenseId,
            expenseItemId: $itemId,
            splits: $request->array('splits'),
        );
    }
}
