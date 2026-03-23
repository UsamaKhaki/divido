<?php

namespace App\Repositories;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GroupRepository
{
    public function findAllForUser(int $userId): Collection
    {
        return Group::whereHas('members', fn ($q) => $q->where('users.id', $userId))
            ->withCount('members')
            ->latest()
            ->get();
    }

    public function create(array $data): Group
    {
        return Group::create($data);
    }

    public function findById(int $id): ?Group
    {
        return Group::with(['creator', 'members'])->find($id);
    }

    public function delete(Group $group): void
    {
        $group->delete();
    }

    public function addMember(Group $group, User $user): void
    {
        $group->members()->attach($user->id);
    }

    public function removeMember(Group $group, int $userId): void
    {
        $group->members()->detach($userId);
    }

    public function isMember(Group $group, int $userId): bool
    {
        return $group->members()->where('users.id', $userId)->exists();
    }
}
