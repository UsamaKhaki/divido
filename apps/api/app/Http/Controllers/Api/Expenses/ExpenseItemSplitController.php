<?php

namespace App\Http\Controllers\Api\Expenses;

use App\Actions\Expenses\UpdateItemSplitsAction;
use App\DTOs\Expenses\SplitData;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Http\Requests\Expenses\UpdateItemSplitsRequest;
use App\Http\Resources\Expenses\ItemSplitResource;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class ExpenseItemSplitController extends Controller
{
    #[OA\Put(
        path: '/expenses/{expenseId}/items/{itemId}/splits',
        summary: 'Assign splits for a specific expense item',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/UpdateItemSplitsRequest'),
        ),
        tags: ['Splits'],
    )]
    #[OA\Parameter(name: 'expenseId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Parameter(name: 'itemId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Splits updated successfully')]
    #[OA\Response(response: 422, description: 'Amounts do not add up')]
    #[OA\Response(response: 403, description: 'Not a group member')]
    #[OA\Response(response: 404, description: 'Expense or item not found')]
    public function update(
        UpdateItemSplitsRequest $request,
        int $expense,
        int $item,
        UpdateItemSplitsAction $action,
    ): JsonResponse {
        $data = SplitData::fromRequest($request, $expense, $item);
        $result = $action->execute($data);

        return ApiResponse::ok([
            'item_id' => $result->id,
            'splits' => ItemSplitResource::collection($result->splits),
        ], 'Splits updated successfully.');
    }
}
