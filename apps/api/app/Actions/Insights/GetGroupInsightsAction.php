<?php

namespace App\Actions\Insights;

use App\Repositories\InsightsRepository;

class GetGroupInsightsAction
{
    public function __construct(private readonly InsightsRepository $repo) {}

    /**
     * @return array{
     *   total_group_spend: float,
     *   spent_per_user: list<array{user: array{id: int, name: string}, total: float}>,
     *   category_breakdown: list<array{category: string, total: float}>,
     * }
     */
    public function execute(int $groupId): array
    {
        $totalGroupSpend = $this->repo->getTotalGroupSpend($groupId);

        $spentPerUser = $this->repo->getSpentPerUser($groupId)
            ->map(fn ($row) => [
                'user'  => ['id' => $row->user_id, 'name' => $row->user_name],
                'total' => (float) round($row->total, 2),
            ])
            ->values()
            ->all();

        $categoryBreakdown = $this->repo->getCategoryBreakdown($groupId)
            ->map(fn ($row) => [
                'category' => $row->category,
                'total'    => (float) round($row->total, 2),
            ])
            ->values()
            ->all();

        return [
            'total_group_spend'  => round($totalGroupSpend, 2),
            'spent_per_user'     => $spentPerUser,
            'category_breakdown' => $categoryBreakdown,
        ];
    }
}
