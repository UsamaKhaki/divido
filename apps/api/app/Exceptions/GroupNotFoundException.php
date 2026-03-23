<?php

namespace App\Exceptions;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class GroupNotFoundException extends RuntimeException implements Renderable
{
    public function render(): JsonResponse
    {
        return response()->json(['message' => 'Group not found.'], 404);
    }
}
