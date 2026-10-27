<?php

use App\Models\Expense;
use App\Models\ExpenseItem;
use App\Models\Group;
use App\Models\Settlement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function splitEvenly(User $actor, ExpenseItem $item, User $first, User $second, float $amountEach)
{
    return test()->actingAs($actor)
        ->putJson("/api/v1/expenses/{$item->expense_id}/items/{$item->id}/splits", [
            'splits' => [
                ['user_id' => $first->id,  'amount' => $amountEach],
                ['user_id' => $second->id, 'amount' => $amountEach],
            ],
        ]);
}

describe('settlement regeneration', function () {

    it('does not ask for a payment that has already been settled', function () {
        $payer = User::factory()->create();
        $debtor = User::factory()->create();
        $group = Group::factory()->hasAttached([$payer, $debtor], [], 'members')->create(['created_by' => $payer->id]);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $payer->id]);
        $dinner = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'price' => 600.00, 'quantity' => 1]);
        $dessert = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'price' => 200.00, 'quantity' => 1]);

        splitEvenly($payer, $dinner, $payer, $debtor, 300.00)->assertOk();

        Settlement::where('group_id', $group->id)
            ->where('status', 'pending')
            ->update(['status' => 'settled', 'settled_at' => now()]);

        // Editing another item regenerates the plan; only the new 100 is still owed.
        splitEvenly($payer, $dessert, $payer, $debtor, 100.00)->assertOk();

        $pending = Settlement::where('group_id', $group->id)->where('status', 'pending')->get();

        expect($pending)->toHaveCount(1)
            ->and($pending->first()->from_user)->toBe($debtor->id)
            ->and($pending->first()->to_user)->toBe($payer->id)
            ->and((float) $pending->first()->amount)->toBe(100.0);

        $this->assertDatabaseHas('settlements', [
            'group_id' => $group->id,
            'amount' => '300.00',
            'status' => 'settled',
        ]);
    });

    it('clears pending settlements when the expense behind them is deleted', function () {
        $payer = User::factory()->create();
        $debtor = User::factory()->create();
        $group = Group::factory()->hasAttached([$payer, $debtor], [], 'members')->create(['created_by' => $payer->id]);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $payer->id]);
        $item = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'price' => 600.00, 'quantity' => 1]);

        splitEvenly($payer, $item, $payer, $debtor, 300.00)->assertOk();
        $this->assertDatabaseHas('settlements', ['group_id' => $group->id, 'status' => 'pending']);

        $this->actingAs($payer)
            ->deleteJson("/api/v1/expenses/{$expense->id}")
            ->assertOk();

        $this->assertDatabaseMissing('settlements', ['group_id' => $group->id, 'status' => 'pending']);
    });
});

describe('split authorisation', function () {

    it('returns 404 when the item belongs to a different expense', function () {
        $user = User::factory()->create();
        $stranger = User::factory()->create();

        $ownGroup = Group::factory()->hasAttached($user, [], 'members')->create(['created_by' => $user->id]);
        $ownExpense = Expense::factory()->create(['group_id' => $ownGroup->id, 'paid_by' => $user->id]);

        $otherGroup = Group::factory()->hasAttached($stranger, [], 'members')->create(['created_by' => $stranger->id]);
        $otherExpense = Expense::factory()->create(['group_id' => $otherGroup->id, 'paid_by' => $stranger->id]);
        $otherItem = ExpenseItem::factory()->create(['expense_id' => $otherExpense->id, 'price' => 100.00, 'quantity' => 1]);

        $this->actingAs($user)
            ->putJson("/api/v1/expenses/{$ownExpense->id}/items/{$otherItem->id}/splits", [
                'splits' => [['user_id' => $user->id, 'amount' => 100.00]],
            ])
            ->assertNotFound();

        $this->assertDatabaseMissing('item_splits', ['expense_item_id' => $otherItem->id]);
    });

    it('returns 422 when a split is assigned to someone outside the group', function () {
        $user = User::factory()->create();
        $outsider = User::factory()->create();
        $group = Group::factory()->hasAttached($user, [], 'members')->create(['created_by' => $user->id]);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id]);
        $item = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'price' => 200.00, 'quantity' => 1]);

        $this->actingAs($user)
            ->putJson("/api/v1/expenses/{$expense->id}/items/{$item->id}/splits", [
                'splits' => [
                    ['user_id' => $user->id,     'amount' => 100.00],
                    ['user_id' => $outsider->id, 'amount' => 100.00],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['splits']);

        $this->assertDatabaseMissing('item_splits', ['expense_item_id' => $item->id]);
    });
});
