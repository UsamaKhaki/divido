<?php

namespace App\Http\Controllers\Api\Groups;

use App\Actions\Suggestions\GetItemSuggestionsAction;
use App\Exceptions\GroupNotFoundException;
use App\Exceptions\NotGroupMemberException;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Repositories\GroupRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class GroupSuggestionController extends Controller
{
    public function __construct(private readonly GroupRepository $groupRepo) {}

    #[OA\Get(
        path: '/groups/{groupId}/suggestions',
        summary: 'Get predicted item→user assignments based on past split history',
        security: [['sanctum' => []]],
        tags: ['Suggestions'],
    )]
    #[OA\Parameter(name: 'groupId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Parameter(
        name: 'items',
        in: 'query',
        required: false,
        description: 'Comma-separated item names, e.g. Sheesha,Drinks',
        schema: new OA\Schema(type: 'string'),
    )]
    #[OA\Response(response: 200, description: 'Suggestions returned')]
    #[OA\Response(response: 403, description: 'Not a group member')]
    #[OA\Response(response: 404, description: 'Group not found')]
    public function index(Request $request, int $groupId, GetItemSuggestionsAction $action): JsonResponse
    {
        $group = $this->groupRepo->findById($groupId);

        if (! $group) {
            throw new GroupNotFoundException;
        }

        if (! $this->groupRepo->isMember($group, $request->user()->id)) {
            throw new NotGroupMemberException;
        }

        $rawItems = (string) $request->query('items', '');
        $itemNames = array_values(array_filter(array_map('trim', explode(',', $rawItems))));

        $suggestions = $itemNames
            ? $action->execute($groupId, $itemNames)
            : [];

        return ApiResponse::ok($suggestions);
    }
}
