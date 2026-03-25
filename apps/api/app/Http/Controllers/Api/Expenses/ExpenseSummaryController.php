<?php

namespace App\Http\Controllers\Api\Expenses;

use App\Actions\Expenses\GenerateExpenseSummaryAction;
use App\Exceptions\ExpenseNotFoundException;
use App\Exceptions\NotGroupMemberException;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Repositories\ExpenseRepository;
use App\Repositories\GroupRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ExpenseSummaryController extends Controller
{
    public function __construct(
        private readonly ExpenseRepository $expenseRepo,
        private readonly GroupRepository   $groupRepo,
    ) {}

    #[OA\Get(
        path: '/expenses/{expenseId}/summary',
        summary: 'Generate a shareable text summary for an expense',
        security: [['sanctum' => []]],
        tags: ['Expenses'],
    )]
    #[OA\Parameter(name: 'expenseId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Summary text returned')]
    #[OA\Response(response: 403, description: 'Not a group member')]
    #[OA\Response(response: 404, description: 'Expense not found')]
    public function show(Request $request, int $expenseId, GenerateExpenseSummaryAction $action): JsonResponse
    {
        $expense = $this->expenseRepo->findById($expenseId);

        if (! $expense) {
            throw new ExpenseNotFoundException();
        }

        if (! $this->groupRepo->isMember($expense->group, $request->user()->id)) {
            throw new NotGroupMemberException();
        }

        return ApiResponse::ok(['summary' => $action->execute($expense)]);
    }
}
