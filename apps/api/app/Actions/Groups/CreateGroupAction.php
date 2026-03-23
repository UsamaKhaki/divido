<?php

namespace App\Actions\Groups;

use App\DTOs\Groups\GroupData;
use App\Models\Group;
use App\Repositories\GroupRepository;

class CreateGroupAction
{
    public function __construct(private readonly GroupRepository $repo) {}

    public function execute(GroupData $data): Group
    {
        $group = $this->repo->create([
            'name'       => $data->name,
            'created_by' => $data->createdBy,
        ]);

        $this->repo->addMember($group, $group->creator);

        return $group->load(['creator', 'members']);
    }
}
