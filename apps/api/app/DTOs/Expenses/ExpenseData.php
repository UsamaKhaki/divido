<?php

namespace App\DTOs\Expenses;

use App\Http\Requests\Expenses\StoreExpenseRequest;

class ExpenseData
{
    public function __construct(
        public readonly int $groupId,
        public readonly int $paidBy,
        public readonly string $title,
        public readonly float $totalAmount,
        public readonly ?string $category,
        public readonly array $items,
    ) {}

    public static function fromRequest(StoreExpenseRequest $request): self
    {
        return new self(
            groupId: $request->integer('group_id'),
            paidBy: $request->user()->id,
            title: $request->string('title')->toString(),
            totalAmount: (float) $request->input('total_amount'),
            category: $request->input('category'),
            items: $request->input('items', []),
        );
    }
}
