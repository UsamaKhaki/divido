<?php

namespace App\Exceptions;

use Illuminate\Contracts\Support\Renderable;
use RuntimeException;
use Symfony\Component\HttpFoundation\JsonResponse;

class ExpenseItemNotFoundException extends RuntimeException implements Renderable
{
    public function __construct()
    {
        parent::__construct('Expense item not found.');
    }

    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 404);
    }
}
