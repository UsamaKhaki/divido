<?php

namespace App\Actions\Groups;

use App\Exceptions\NotGroupCreatorException;
use App\Models\Group;
use App\Repositories\GroupRepository;

class DeleteGroupAction
{
    public function __construct(private readonly GroupRepository $repo) {}

    public function execute(Group $group, int $userId): void
    {
        if ($group->created_by !== $userId) {
            throw new NotGroupCreatorException();
        }

        $this->repo->delete($group);
    }
}
