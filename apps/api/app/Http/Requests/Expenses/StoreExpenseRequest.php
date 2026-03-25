<?php

namespace App\Http\Requests\Expenses;

use App\Repositories\GroupRepository;
use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'StoreExpenseRequest',
    required: ['group_id', 'title', 'total_amount'],
)]
class StoreExpenseRequest extends FormRequest
{
    #[OA\Property(property: 'group_id', type: 'integer', example: 1)]
    #[OA\Property(property: 'title', type: 'string', example: 'Dinner')]
    #[OA\Property(property: 'total_amount', type: 'number', format: 'float', example: 1200.00)]
    #[OA\Property(property: 'category', type: 'string', example: 'food', nullable: true)]
    public function authorize(): bool
    {
        $groupId = $this->integer('group_id');
        if (! $groupId) {
            return true; // Let validation handle missing group_id
        }

        $repo = app(GroupRepository::class);
        $group = $repo->findById($groupId);

        if (! $group) {
            return false;
        }

        return $repo->isMember($group, $this->user()->id);
    }

    public function rules(): array
    {
        return [
            'group_id' => ['required', 'integer', 'exists:groups,id'],
            'title' => ['required', 'string', 'max:255'],
            'total_amount' => ['required', 'numeric', 'min:0.01'],
            'category' => ['nullable', 'string', 'in:food,transport,accommodation,entertainment,shopping,other'],
            'items' => ['nullable', 'array'],
            'items.*.name' => ['required_with:items', 'string', 'max:255'],
            'items.*.price' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
