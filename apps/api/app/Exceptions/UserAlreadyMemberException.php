<?php

namespace App\Exceptions;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class UserAlreadyMemberException extends RuntimeException implements Renderable
{
    public function render(): JsonResponse
    {
        return response()->json(['message' => 'This user is already a member of the group.'], 422);
    }
}
