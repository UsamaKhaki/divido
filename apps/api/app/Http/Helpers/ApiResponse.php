<?php

namespace App\Http\Helpers;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function ok(mixed $data, ?string $message = null): JsonResponse
    {
        $payload = ['data' => $data];
        if ($message !== null) {
            $payload['message'] = $message;
        }

        return response()->json($payload, 200);
    }

    public static function created(mixed $data, string $message): JsonResponse
    {
        return response()->json([
            'data'    => $data,
            'message' => $message,
        ], 201);
    }

    public static function noContent(string $message): JsonResponse
    {
        return response()->json([
            'data'    => null,
            'message' => $message,
        ], 200);
    }
}
