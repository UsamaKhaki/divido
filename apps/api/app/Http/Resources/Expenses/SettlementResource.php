<?php

namespace App\Http\Resources\Expenses;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Auth\UserResource;
use OpenApi\Attributes as OA;

#[OA\Schema(schema: 'SettlementResource')]
class SettlementResource extends JsonResource
{
    #[OA\Property(property: 'id', type: 'integer')]
    #[OA\Property(property: 'from', ref: '#/components/schemas/UserResource')]
    #[OA\Property(property: 'to', ref: '#/components/schemas/UserResource')]
    #[OA\Property(property: 'amount', type: 'number', format: 'float')]
    #[OA\Property(property: 'status', type: 'string', enum: ['pending', 'settled'])]
    #[OA\Property(property: 'settled_at', type: 'string', format: 'date-time', nullable: true)]

    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'from'       => new UserResource($this->fromUser),
            'to'         => new UserResource($this->toUser),
            'amount'     => (float) $this->amount,
            'status'     => $this->status,
            'settled_at' => $this->settled_at?->toISOString(),
        ];
    }
}
