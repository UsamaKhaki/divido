<?php

namespace App\Actions\Expenses;

use App\Repositories\ItemSplitRepository;
use App\Repositories\SettlementRepository;

class RegenerateGroupSettlementsAction
{
    public function __construct(
        private ItemSplitRepository $splitRepo,
        private SettlementRepository $settlementRepo,
    ) {}

    public function execute(int $groupId): void
    {
        $splits = $this->splitRepo->getForGroup($groupId);

        // Calculate net balances: positive = owed money, negative = owes money
        $balances = [];

        foreach ($splits as $split) {
            $payerId = $split->expenseItem->expense->paid_by;
            $userId = $split->user_id;
            $amount = (float) $split->amount;

            if ($userId !== $payerId) {
                $balances[$userId] = ($balances[$userId] ?? 0.0) - $amount;
                $balances[$payerId] = ($balances[$payerId] ?? 0.0) + $amount;
            }
        }

        // Payments already made reduce what each debtor still owes. Without
        // this, every regeneration would ask for settled debts again.
        foreach ($this->settlementRepo->findSettledForGroup($groupId) as $settlement) {
            $amount = (float) $settlement->amount;
            $balances[$settlement->from_user] = ($balances[$settlement->from_user] ?? 0.0) + $amount;
            $balances[$settlement->to_user] = ($balances[$settlement->to_user] ?? 0.0) - $amount;
        }

        // Separate into creditors (owed money) and debtors (owe money)
        $creditors = [];
        $debtors = [];

        foreach ($balances as $userId => $balance) {
            if ($balance > 0.005) {
                $creditors[] = ['user_id' => $userId, 'amount' => $balance];
            } elseif ($balance < -0.005) {
                $debtors[] = ['user_id' => $userId, 'amount' => abs($balance)];
            }
        }

        // Greedy debt minimization
        $newSettlements = [];

        $ci = 0;
        $di = 0;

        while ($ci < count($creditors) && $di < count($debtors)) {
            $credit = $creditors[$ci]['amount'];
            $debt = $debtors[$di]['amount'];

            $settled = min($credit, $debt);

            $newSettlements[] = [
                'from_user' => $debtors[$di]['user_id'],
                'to_user' => $creditors[$ci]['user_id'],
                'amount' => round($settled, 2),
            ];

            $creditors[$ci]['amount'] -= $settled;
            $debtors[$di]['amount'] -= $settled;

            if ($creditors[$ci]['amount'] < 0.005) {
                $ci++;
            }

            if ($debtors[$di]['amount'] < 0.005) {
                $di++;
            }
        }

        $this->settlementRepo->replacePendingForGroup($groupId, $newSettlements);
    }
}
