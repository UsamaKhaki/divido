<?php

namespace App\Http\Requests\Expenses;

use App\Models\Expense;
use App\Repositories\GroupRepository;
use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'UpdateItemSplitsRequest',
    required: ['splits'],
)]
class UpdateItemSplitsRequest extends FormRequest
{
    #[OA\Property(
        property: 'splits',
        type: 'array',
        items: new OA\Items(
            required: ['user_id', 'amount'],
            properties: [
                new OA\Property(property: 'user_id', type: 'integer', example: 1),
                new OA\Property(property: 'amount', type: 'number', format: 'float', example: 300.00),
            ],
        ),
    )]
    public function authorize(): bool
    {
        $expenseParam = $this->route('expense');
        if (! $expenseParam) {
            return true;
        }

        $expense = $expenseParam instanceof Expense
            ? $expenseParam
            : Expense::find((int) $expenseParam);

        if (! $expense) {
            return true; // Let controller throw 404
        }

        $repo = app(GroupRepository::class);
        $group = $repo->findById($expense->group_id);

        if (! $group) {
            return true;
        }

        return $repo->isMember($group, $this->user()->id);
    }

    public function rules(): array
    {
        return [
            'splits' => ['required', 'array', 'min:1'],
            'splits.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'splits.*.amount' => ['required', 'numeric', 'min:0.01'],
        ];
    }
}
