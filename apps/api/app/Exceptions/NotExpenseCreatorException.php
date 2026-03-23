<?php

namespace App\Exceptions;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class NotExpenseCreatorException extends RuntimeException implements Renderable
{
    public function render(): JsonResponse
    {
        return response()->json(['message' => 'Only the expense creator can perform this action.'], 403);
    }
}
