<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class GoogleVisionException extends Exception
{
    public function render(): JsonResponse
    {
        return response()->json([
            'message' => 'OCR service unavailable. Please try again or enter items manually.',
        ], 502);
    }
}
