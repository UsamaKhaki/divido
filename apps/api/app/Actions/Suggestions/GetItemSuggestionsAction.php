<?php

namespace App\Actions\Suggestions;

use App\Repositories\SuggestionsRepository;
use Illuminate\Support\Collection;

class GetItemSuggestionsAction
{
    public function __construct(private readonly SuggestionsRepository $repo) {}

    /**
     * For each requested item name, return suggested users with confidence scores.
     *
     * Confidence = this user's assignment count / total assignments for that item name.
     *
     * @param  array<int, string>                                                                                                        $itemNames
     * @return array<int, array{item_name: string, suggested_users: list<array{user: array{id: int, name: string}, confidence: float}>}>
     */
    public function execute(int $groupId, array $itemNames): array
    {
        $rows = $this->repo->getAssignmentCounts($groupId, $itemNames);

        // Group rows by item_name (case-insensitive match to original requested names)
        $grouped = $rows->groupBy(fn ($row) => strtolower($row->item_name));

        return collect($itemNames)->map(function (string $name) use ($grouped): array {
            $key = strtolower($name);
            $users = $grouped->get($key, collect());

            /** @var Collection $users */
            $total = $users->sum('assignment_count');

            $suggestedUsers = $users->map(fn ($row) => [
                'user' => ['id' => $row->user_id, 'name' => $row->user_name],
                'confidence' => $total > 0 ? round($row->assignment_count / $total, 2) : 0.0,
            ])->values()->all();

            return [
                'item_name' => $name,
                'suggested_users' => $suggestedUsers,
            ];
        })->values()->all();
    }
}
