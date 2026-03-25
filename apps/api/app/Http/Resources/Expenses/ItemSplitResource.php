<?php

namespace App\Http\Resources\Expenses;

use App\Http\Resources\Auth\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(schema: 'ItemSplitResource')]
class ItemSplitResource extends JsonResource
{
    #[OA\Property(property: 'user', ref: '#/components/schemas/UserResource')]
    #[OA\Property(property: 'amount', type: 'number', format: 'float')]
    public function toArray(Request $request): array
    {
        return [
            'user' => new UserResource($this->user),
            'amount' => (float) $this->amount,
        ];
    }
}
