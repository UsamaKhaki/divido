<?php

namespace App\Http\Controllers\Api\Groups;

use App\Actions\Groups\AddGroupMemberAction;
use App\Actions\Groups\RemoveGroupMemberAction;
use App\DTOs\Groups\AddMemberData;
use App\Exceptions\GroupNotFoundException;
use App\Exceptions\NotGroupMemberException;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Http\Requests\Groups\AddMemberRequest;
use App\Http\Resources\Auth\UserResource;
use App\Repositories\GroupRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class GroupMemberController extends Controller
{
    public function __construct(private readonly GroupRepository $repo) {}

    #[OA\Post(
        path: '/groups/{groupId}/members',
        summary: 'Add a member to a group by email',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/AddMemberRequest'),
        ),
        tags: ['Groups'],
    )]
    #[OA\Parameter(name: 'groupId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Member added successfully')]
    #[OA\Response(response: 403, description: 'Not a group member')]
    #[OA\Response(response: 404, description: 'Group or user not found')]
    #[OA\Response(response: 422, description: 'Already a member')]
    public function store(AddMemberRequest $request, int $groupId, AddGroupMemberAction $action): JsonResponse
    {
        $group = $this->repo->findById($groupId);

        if (! $group) {
            throw new GroupNotFoundException();
        }

        $user = $action->execute($group, AddMemberData::fromRequest($request));

        return ApiResponse::ok(new UserResource($user), 'Member added successfully.');
    }

    #[OA\Delete(
        path: '/groups/{groupId}/members/{userId}',
        summary: 'Remove a member from a group',
        security: [['sanctum' => []]],
        tags: ['Groups'],
    )]
    #[OA\Parameter(name: 'groupId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Parameter(name: 'userId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Member removed successfully')]
    #[OA\Response(response: 403, description: 'Unauthorized')]
    #[OA\Response(response: 404, description: 'Group or member not found')]
    public function destroy(Request $request, int $groupId, int $userId, RemoveGroupMemberAction $action): JsonResponse
    {
        $group = $this->repo->findById($groupId);

        if (! $group) {
            throw new GroupNotFoundException();
        }

        if (! $this->repo->isMember($group, $request->user()->id)) {
            throw new NotGroupMemberException();
        }

        $action->execute($group, $userId, $request->user()->id);

        return ApiResponse::noContent('Member removed successfully.');
    }
}
