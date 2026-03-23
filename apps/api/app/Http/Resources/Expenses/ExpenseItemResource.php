<?php

namespace App\Http\Resources\Expenses;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

// ItemSplitResource is in the same namespace — referenced below
#[OA\Schema(schema: 'ExpenseItemResource')]
class ExpenseItemResource extends JsonResource
{
    #[OA\Property(property: 'id', type: 'integer')]
    #[OA\Property(property: 'name', type: 'string')]
    #[OA\Property(property: 'price', type: 'number', format: 'float')]
    #[OA\Property(property: 'quantity', type: 'integer')]

    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'name'     => $this->name,
            'price'    => (float) $this->price,
            'quantity' => $this->quantity,
            'splits'   => ItemSplitResource::collection($this->whenLoaded('splits')),
        ];
    }
}
