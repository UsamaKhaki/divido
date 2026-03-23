<?php

namespace App\Http\Resources\Groups;

use App\Http\Resources\Auth\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(schema: 'GroupResource')]
class GroupResource extends JsonResource
{
    #[OA\Property(property: 'id', type: 'integer')]
    #[OA\Property(property: 'name', type: 'string')]
    #[OA\Property(property: 'created_by', type: 'integer')]
    #[OA\Property(property: 'created_at', type: 'string', format: 'date-time')]

    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'created_by' => $this->created_by,
            'members'    => UserResource::collection($this->whenLoaded('members')),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
