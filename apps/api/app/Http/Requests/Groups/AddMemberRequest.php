<?php

namespace App\Http\Requests\Groups;

use App\Repositories\GroupRepository;
use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AddMemberRequest',
    required: ['email'],
)]
class AddMemberRequest extends FormRequest
{
    #[OA\Property(property: 'email', type: 'string', format: 'email', example: 'waqas@example.com')]

    public function authorize(): bool
    {
        $groupParam = $this->route('group');

        if (! $groupParam) {
            return false;
        }

        $repo  = app(GroupRepository::class);
        $group = $groupParam instanceof \App\Models\Group
            ? $groupParam
            : $repo->findById((int) $groupParam);

        if (! $group) {
            return true; // Group not found — let controller throw 404
        }

        return $repo->isMember($group, $this->user()->id);
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255', 'exists:users,email'],
        ];
    }
}
