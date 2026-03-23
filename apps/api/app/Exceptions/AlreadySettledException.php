<?php

namespace App\Exceptions;

use Illuminate\Contracts\Support\Renderable;
use RuntimeException;
use Symfony\Component\HttpFoundation\JsonResponse;

class AlreadySettledException extends RuntimeException implements Renderable
{
    public function __construct()
    {
        parent::__construct('This settlement has already been paid.');
    }

    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 422);
    }
}
