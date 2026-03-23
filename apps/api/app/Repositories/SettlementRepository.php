<?php

namespace App\Repositories;

use App\Models\Settlement;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

class SettlementRepository
{
    public function findByGroup(int $groupId): Collection
    {
        return Settlement::with(['fromUser', 'toUser'])
            ->where('group_id', $groupId)
            ->orderBy('status')
            ->orderByDesc('created_at')
            ->get();
    }

    public function findById(int $id): ?Settlement
    {
        return Settlement::with(['fromUser', 'toUser'])->find($id);
    }

    /**
     * Replace all pending settlements for a group with a fresh computed set.
     *
     * @param array<int, array{from_user: int, to_user: int, amount: float}> $settlements
     */
    public function replacePendingForGroup(int $groupId, array $settlements): void
    {
        Settlement::where('group_id', $groupId)
            ->where('status', 'pending')
            ->delete();

        foreach ($settlements as $s) {
            Settlement::create([
                'group_id'  => $groupId,
                'from_user' => $s['from_user'],
                'to_user'   => $s['to_user'],
                'amount'    => $s['amount'],
                'status'    => 'pending',
            ]);
        }
    }

    public function markSettled(Settlement $settlement): Settlement
    {
        $settlement->update([
            'status'     => 'settled',
            'settled_at' => Carbon::now(),
        ]);

        return $settlement->fresh(['fromUser', 'toUser']);
    }
}
