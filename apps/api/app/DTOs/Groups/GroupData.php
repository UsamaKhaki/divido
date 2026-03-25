<?php

namespace App\DTOs\Groups;

use App\Http\Requests\Groups\StoreGroupRequest;

class GroupData
{
    public function __construct(
        public readonly string $name,
        public readonly int $createdBy,
    ) {}

    public static function fromRequest(StoreGroupRequest $request): self
    {
        return new self(
            name: $request->string('name')->toString(),
            createdBy: $request->user()->id,
        );
    }
}
