<?php

namespace App\Exceptions;

use Illuminate\Contracts\Support\Renderable;
use RuntimeException;
use Symfony\Component\HttpFoundation\JsonResponse;

class NotSettlementPayerException extends RuntimeException implements Renderable
{
    public function __construct()
    {
        parent::__construct('Only the payer can mark this settlement as paid.');
    }

    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 403);
    }
}
