<?php

namespace App\Http\Controllers\Api\Groups;

use App\Exceptions\GroupNotFoundException;
use App\Exceptions\NotGroupMemberException;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Http\Resources\Expenses\SettlementResource;
use App\Repositories\GroupRepository;
use App\Repositories\SettlementRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class GroupSettlementController extends Controller
{
    public function __construct(
        private GroupRepository $groupRepo,
        private SettlementRepository $settlementRepo,
    ) {}

    #[OA\Get(
        path: '/groups/{groupId}/settlements',
        summary: 'Get the optimized settlement plan for a group',
        security: [['sanctum' => []]],
        tags: ['Settlements'],
    )]
    #[OA\Parameter(name: 'groupId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Settlement plan returned')]
    #[OA\Response(response: 403, description: 'Not a group member')]
    #[OA\Response(response: 404, description: 'Group not found')]
    public function index(Request $request, int $group): JsonResponse
    {
        $groupModel = $this->groupRepo->findById($group);

        if (! $groupModel) {
            throw new GroupNotFoundException;
        }

        if (! $this->groupRepo->isMember($groupModel, $request->user()->id)) {
            throw new NotGroupMemberException;
        }

        $settlements = $this->settlementRepo->findByGroup($group);

        $totalUnsettled = $settlements
            ->where('status', 'pending')
            ->sum(fn ($s) => (float) $s->amount);

        return ApiResponse::ok([
            'settlements' => SettlementResource::collection($settlements),
            'total_unsettled' => (float) round($totalUnsettled, 2),
        ]);
    }
}
