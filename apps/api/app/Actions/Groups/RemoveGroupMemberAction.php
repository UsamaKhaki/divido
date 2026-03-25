<?php

namespace App\Actions\Groups;

use App\Exceptions\NotGroupCreatorException;
use App\Models\Group;
use App\Repositories\GroupRepository;

class RemoveGroupMemberAction
{
    public function __construct(private readonly GroupRepository $repo) {}

    public function execute(Group $group, int $targetUserId, int $authUserId): void
    {
        $isCreator = $group->created_by === $authUserId;
        $isSelf = $targetUserId === $authUserId;

        if (! $isCreator && ! $isSelf) {
            throw new NotGroupCreatorException;
        }

        $this->repo->removeMember($group, $targetUserId);
    }
}
