<?php

namespace App\Http\Resources\Expenses;

use App\Http\Resources\Auth\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(schema: 'ExpenseListResource')]
class ExpenseListResource extends JsonResource
{
    #[OA\Property(property: 'id', type: 'integer')]
    #[OA\Property(property: 'title', type: 'string')]
    #[OA\Property(property: 'total_amount', type: 'number', format: 'float')]
    #[OA\Property(property: 'category', type: 'string', nullable: true)]
    #[OA\Property(property: 'created_at', type: 'string', format: 'date-time')]
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'total_amount' => (float) $this->total_amount,
            'category' => $this->category,
            'paid_by' => new UserResource($this->whenLoaded('paidBy')),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
