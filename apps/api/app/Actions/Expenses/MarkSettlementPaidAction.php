<?php

namespace App\Actions\Expenses;

use App\Exceptions\AlreadySettledException;
use App\Exceptions\NotSettlementPayerException;
use App\Exceptions\SettlementNotFoundException;
use App\Models\Settlement;
use App\Repositories\SettlementRepository;

class MarkSettlementPaidAction
{
    public function __construct(private SettlementRepository $repo) {}

    public function execute(int $settlementId, int $userId): Settlement
    {
        $settlement = $this->repo->findById($settlementId);

        if (! $settlement) {
            throw new SettlementNotFoundException();
        }

        if ($settlement->from_user !== $userId) {
            throw new NotSettlementPayerException();
        }

        if ($settlement->status === 'settled') {
            throw new AlreadySettledException();
        }

        return $this->repo->markSettled($settlement);
    }
}
