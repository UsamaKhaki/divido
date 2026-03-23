<?php

namespace App\Exceptions;

use Illuminate\Contracts\Support\Renderable;
use RuntimeException;
use Symfony\Component\HttpFoundation\JsonResponse;

class InvalidSplitAmountException extends RuntimeException implements Renderable
{
    public function __construct(string $message = 'Split amounts must equal the item total.')
    {
        parent::__construct($message);
    }

    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 422);
    }
}
