<?php

namespace App\Http\Controllers\Api\Groups;

use App\Actions\Insights\GetGroupInsightsAction;
use App\Exceptions\GroupNotFoundException;
use App\Exceptions\NotGroupMemberException;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Repositories\GroupRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class GroupInsightsController extends Controller
{
    public function __construct(private readonly GroupRepository $groupRepo) {}

    #[OA\Get(
        path: '/groups/{groupId}/insights',
        summary: 'Get spending analytics for a group',
        security: [['sanctum' => []]],
        tags: ['Insights'],
    )]
    #[OA\Parameter(name: 'groupId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Insights returned')]
    #[OA\Response(response: 403, description: 'Not a group member')]
    #[OA\Response(response: 404, description: 'Group not found')]
    public function show(Request $request, int $groupId, GetGroupInsightsAction $action): JsonResponse
    {
        $group = $this->groupRepo->findById($groupId);

        if (! $group) {
            throw new GroupNotFoundException();
        }

        if (! $this->groupRepo->isMember($group, $request->user()->id)) {
            throw new NotGroupMemberException();
        }

        return ApiResponse::ok($action->execute($groupId));
    }
}
