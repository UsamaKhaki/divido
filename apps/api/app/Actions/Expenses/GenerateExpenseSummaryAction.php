<?php

namespace App\Actions\Expenses;

use App\Models\Expense;
use Illuminate\Support\Facades\DB;

class GenerateExpenseSummaryAction
{
    public function execute(Expense $expense): string
    {
        $expense->loadMissing(['group', 'paidBy', 'items']);

        $groupName = $expense->group->name;
        $title     = $expense->title;
        $total     = number_format((float) $expense->total_amount, 0);
        $payer     = $expense->paidBy->name;

        // Sum item_splits per user for this expense
        $splits = DB::table('item_splits')
            ->join('expense_items', 'item_splits.expense_item_id', '=', 'expense_items.id')
            ->join('users', 'item_splits.user_id', '=', 'users.id')
            ->where('expense_items.expense_id', $expense->id)
            ->where('item_splits.user_id', '!=', $expense->paid_by)
            ->select('users.name', DB::raw('SUM(item_splits.amount) as total_owed'))
            ->groupBy('item_splits.user_id', 'users.name')
            ->orderByDesc('total_owed')
            ->get();

        $lines = ["{$groupName} — {$title}", "Total: PKR {$total}", '', "{$payer} paid"];

        foreach ($splits as $split) {
            $amount  = number_format((float) $split->total_owed, 0);
            $lines[] = "{$split->name} owes PKR {$amount}";
        }

        $lines[] = '';
        $lines[] = 'Settled via Divido';

        return implode("\n", $lines);
    }
}
