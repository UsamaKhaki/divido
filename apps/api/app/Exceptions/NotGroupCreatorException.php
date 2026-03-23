<?php

namespace App\Exceptions;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class NotGroupCreatorException extends RuntimeException implements Renderable
{
    public function render(): JsonResponse
    {
        return response()->json(['message' => 'Only the group creator can perform this action.'], 403);
    }
}
