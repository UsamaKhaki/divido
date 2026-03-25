<?php

namespace App\Actions\Groups;

use App\DTOs\Groups\AddMemberData;
use App\Exceptions\UserAlreadyMemberException;
use App\Models\Group;
use App\Models\User;
use App\Repositories\GroupRepository;

class AddGroupMemberAction
{
    public function __construct(private readonly GroupRepository $repo) {}

    public function execute(Group $group, AddMemberData $data): User
    {
        $user = User::where('email', $data->email)->firstOrFail();

        if ($this->repo->isMember($group, $user->id)) {
            throw new UserAlreadyMemberException;
        }

        $this->repo->addMember($group, $user);

        return $user;
    }
}
