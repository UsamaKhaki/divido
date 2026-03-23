<?php

namespace App\DTOs\Groups;

use App\Http\Requests\Groups\AddMemberRequest;

class AddMemberData
{
    public function __construct(
        public readonly string $email,
    ) {}

    public static function fromRequest(AddMemberRequest $request): self
    {
        return new self(
            email: $request->string('email')->toString(),
        );
    }
}
