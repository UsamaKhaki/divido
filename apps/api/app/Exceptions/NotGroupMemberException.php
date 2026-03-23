<?php

namespace App\Exceptions;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class NotGroupMemberException extends RuntimeException implements Renderable
{
    public function render(): JsonResponse
    {
        return response()->json(['message' => 'You are not a member of this group.'], 403);
    }
}
