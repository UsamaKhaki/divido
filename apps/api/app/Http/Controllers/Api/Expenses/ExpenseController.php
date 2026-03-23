<?php

namespace App\Http\Controllers\Api\Expenses;

use App\Actions\Expenses\CreateExpenseAction;
use App\Actions\Expenses\DeleteExpenseAction;
use App\DTOs\Expenses\ExpenseData;
use App\Exceptions\ExpenseNotFoundException;
use App\Exceptions\GroupNotFoundException;
use App\Exceptions\NotGroupMemberException;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Http\Requests\Expenses\StoreExpenseRequest;
use App\Http\Resources\Expenses\ExpenseListResource;
use App\Http\Resources\Expenses\ExpenseResource;
use App\Repositories\ExpenseRepository;
use App\Repositories\GroupRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ExpenseController extends Controller
{
    public function __construct(
        private readonly ExpenseRepository $expenseRepo,
        private readonly GroupRepository   $groupRepo,
    ) {}

    #[OA\Get(
        path: '/groups/{groupId}/expenses',
        summary: 'List paginated expenses for a group',
        security: [['sanctum' => []]],
        tags: ['Expenses'],
    )]
    #[OA\Parameter(name: 'groupId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer'))]
    #[OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'List of expenses')]
    #[OA\Response(response: 403, description: 'Not a group member')]
    #[OA\Response(response: 404, description: 'Group not found')]
    public function index(Request $request, int $groupId): JsonResponse
    {
        $group = $this->groupRepo->findById($groupId);

        if (! $group) {
            throw new GroupNotFoundException();
        }

        if (! $this->groupRepo->isMember($group, $request->user()->id)) {
            throw new NotGroupMemberException();
        }

        $perPage   = min((int) $request->query('per_page', 15), 100);
        $paginator = $this->expenseRepo->findByGroupPaginated($groupId, $perPage);

        return response()->json([
            'data' => ExpenseListResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    #[OA\Post(
        path: '/expenses',
        summary: 'Create a new expense with optional items',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/StoreExpenseRequest'),
        ),
        tags: ['Expenses'],
    )]
    #[OA\Response(response: 201, description: 'Expense created successfully')]
    #[OA\Response(response: 403, description: 'Not a group member')]
    #[OA\Response(response: 422, description: 'Validation error')]
    public function store(StoreExpenseRequest $request, CreateExpenseAction $action): JsonResponse
    {
        $expense = $action->execute(ExpenseData::fromRequest($request));

        return ApiResponse::created(new ExpenseResource($expense), 'Expense created successfully.');
    }

    #[OA\Get(
        path: '/expenses/{expenseId}',
        summary: 'Get a single expense with items',
        security: [['sanctum' => []]],
        tags: ['Expenses'],
    )]
    #[OA\Parameter(name: 'expenseId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Expense details')]
    #[OA\Response(response: 403, description: 'Not a group member')]
    #[OA\Response(response: 404, description: 'Expense not found')]
    public function show(Request $request, int $expenseId): JsonResponse
    {
        $expense = $this->expenseRepo->findById($expenseId);

        if (! $expense) {
            throw new ExpenseNotFoundException();
        }

        $group = $this->groupRepo->findById($expense->group_id);

        if (! $group || ! $this->groupRepo->isMember($group, $request->user()->id)) {
            throw new NotGroupMemberException();
        }

        return ApiResponse::ok(new ExpenseResource($expense));
    }

    #[OA\Delete(
        path: '/expenses/{expenseId}',
        summary: 'Delete an expense (creator only)',
        security: [['sanctum' => []]],
        tags: ['Expenses'],
    )]
    #[OA\Parameter(name: 'expenseId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Expense deleted successfully')]
    #[OA\Response(response: 403, description: 'Not the creator')]
    #[OA\Response(response: 404, description: 'Expense not found')]
    public function destroy(Request $request, int $expenseId, DeleteExpenseAction $action): JsonResponse
    {
        $expense = $this->expenseRepo->findById($expenseId);

        if (! $expense) {
            throw new ExpenseNotFoundException();
        }

        $action->execute($expense, $request->user()->id);

        return ApiResponse::noContent('Expense deleted successfully.');
    }
}
