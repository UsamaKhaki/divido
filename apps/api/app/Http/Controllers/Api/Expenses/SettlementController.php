<?php

namespace App\Http\Controllers\Api\Expenses;

use App\Actions\Expenses\MarkSettlementPaidAction;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Http\Resources\Expenses\SettlementResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class SettlementController extends Controller
{
    #[OA\Post(
        path: '/settlements/{settlementId}/settle',
        summary: 'Mark a settlement as paid',
        security: [['sanctum' => []]],
        tags: ['Settlements'],
    )]
    #[OA\Parameter(name: 'settlementId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Settlement marked as paid')]
    #[OA\Response(response: 403, description: 'Not the payer')]
    #[OA\Response(response: 404, description: 'Settlement not found')]
    #[OA\Response(response: 422, description: 'Already settled')]
    public function settle(Request $request, int $settlement, MarkSettlementPaidAction $action): JsonResponse
    {
        $result = $action->execute($settlement, $request->user()->id);

        return ApiResponse::ok(
            new SettlementResource($result),
            'Settlement marked as paid.',
        );
    }
}
