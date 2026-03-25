<?php

namespace App\Http\Controllers\Api\Groups;

use App\Actions\Groups\CreateGroupAction;
use App\Actions\Groups\DeleteGroupAction;
use App\DTOs\Groups\GroupData;
use App\Exceptions\GroupNotFoundException;
use App\Exceptions\NotGroupMemberException;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Http\Requests\Groups\StoreGroupRequest;
use App\Http\Resources\Groups\GroupListResource;
use App\Http\Resources\Groups\GroupResource;
use App\Repositories\GroupRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class GroupController extends Controller
{
    public function __construct(private readonly GroupRepository $repo) {}

    #[OA\Get(
        path: '/groups',
        summary: 'List all groups for the authenticated user',
        security: [['sanctum' => []]],
        tags: ['Groups'],
    )]
    #[OA\Response(response: 200, description: 'List of groups')]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    public function index(Request $request): JsonResponse
    {
        $groups = $this->repo->findAllForUser($request->user()->id);

        return ApiResponse::ok(GroupListResource::collection($groups));
    }

    #[OA\Post(
        path: '/groups',
        summary: 'Create a new group',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/StoreGroupRequest'),
        ),
        tags: ['Groups'],
    )]
    #[OA\Response(response: 201, description: 'Group created successfully')]
    #[OA\Response(response: 422, description: 'Validation error')]
    public function store(StoreGroupRequest $request, CreateGroupAction $action): JsonResponse
    {
        $group = $action->execute(GroupData::fromRequest($request));

        return ApiResponse::created(new GroupResource($group), 'Group created successfully.');
    }

    #[OA\Get(
        path: '/groups/{groupId}',
        summary: 'Get a single group with its members',
        security: [['sanctum' => []]],
        tags: ['Groups'],
    )]
    #[OA\Parameter(name: 'groupId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Group details')]
    #[OA\Response(response: 403, description: 'Not a member')]
    #[OA\Response(response: 404, description: 'Group not found')]
    public function show(Request $request, int $groupId): JsonResponse
    {
        $group = $this->repo->findById($groupId);

        if (! $group) {
            throw new GroupNotFoundException;
        }

        if (! $this->repo->isMember($group, $request->user()->id)) {
            throw new NotGroupMemberException;
        }

        return ApiResponse::ok(new GroupResource($group));
    }

    #[OA\Delete(
        path: '/groups/{groupId}',
        summary: 'Delete a group (creator only)',
        security: [['sanctum' => []]],
        tags: ['Groups'],
    )]
    #[OA\Parameter(name: 'groupId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Group deleted successfully')]
    #[OA\Response(response: 403, description: 'Not the creator')]
    #[OA\Response(response: 404, description: 'Group not found')]
    public function destroy(Request $request, int $groupId, DeleteGroupAction $action): JsonResponse
    {
        $group = $this->repo->findById($groupId);

        if (! $group) {
            throw new GroupNotFoundException;
        }

        $action->execute($group, $request->user()->id);

        return ApiResponse::noContent('Group deleted successfully.');
    }
}
