<?php

namespace App\Http\Resources\Groups;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(schema: 'GroupListResource')]
class GroupListResource extends JsonResource
{
    #[OA\Property(property: 'id', type: 'integer')]
    #[OA\Property(property: 'name', type: 'string')]
    #[OA\Property(property: 'created_by', type: 'integer')]
    #[OA\Property(property: 'member_count', type: 'integer')]
    #[OA\Property(property: 'created_at', type: 'string', format: 'date-time')]
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'created_by' => $this->created_by,
            'member_count' => $this->members_count ?? 0,
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
