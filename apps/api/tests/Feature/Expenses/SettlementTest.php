<?php

use App\Models\Expense;
use App\Models\ExpenseItem;
use App\Models\Group;
use App\Models\ItemSplit;
use App\Models\Settlement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

// Helper: create a group with splits so settlements can be generated
function setupGroupWithSplits(User $payer, User $debtor, float $splitAmount = 300.00): array
{
    $group = Group::factory()->hasAttached([$payer, $debtor], [], 'members')->create(['created_by' => $payer->id]);
    $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $payer->id]);
    $item = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'price' => $splitAmount * 2, 'quantity' => 1]);

    // Create splits directly
    ItemSplit::create(['expense_item_id' => $item->id, 'user_id' => $payer->id,  'amount' => $splitAmount]);
    ItemSplit::create(['expense_item_id' => $item->id, 'user_id' => $debtor->id, 'amount' => $splitAmount]);

    // Create a pending settlement manually
    $settlement = Settlement::create([
        'group_id' => $group->id,
        'from_user' => $debtor->id,
        'to_user' => $payer->id,
        'amount' => $splitAmount,
        'status' => 'pending',
    ]);

    return compact('group', 'expense', 'item', 'settlement');
}

describe('GET /api/v1/groups/{group}/settlements', function () {

    it('returns the settlement plan for the group', function () {
        $payer = User::factory()->create();
        $debtor = User::factory()->create();
        $data = setupGroupWithSplits($payer, $debtor, 300.00);

        $response = $this->actingAs($payer)
            ->getJson("/api/v1/groups/{$data['group']->id}/settlements");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'settlements',
                    'total_unsettled',
                ],
            ])
            ->assertJsonCount(1, 'data.settlements')
            ->assertJsonPath('data.total_unsettled', 300);
    });

    it('returns 403 when not a group member', function () {
        $payer = User::factory()->create();
        $debtor = User::factory()->create();
        $outsider = User::factory()->create();
        $data = setupGroupWithSplits($payer, $debtor);

        $this->actingAs($outsider)
            ->getJson("/api/v1/groups/{$data['group']->id}/settlements")
            ->assertForbidden();
    });

    it('returns 404 when group does not exist', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/groups/999/settlements')
            ->assertNotFound();
    });

    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/v1/groups/1/settlements')->assertUnauthorized();
    });

    it('returns empty settlements list for a new group', function () {
        $user = User::factory()->create();
        $group = Group::factory()->hasAttached($user, [], 'members')->create(['created_by' => $user->id]);

        $this->actingAs($user)
            ->getJson("/api/v1/groups/{$group->id}/settlements")
            ->assertOk()
            ->assertJsonCount(0, 'data.settlements')
            ->assertJsonPath('data.total_unsettled', 0);
    });
});

describe('POST /api/v1/settlements/{settlement}/settle', function () {

    it('marks a settlement as paid', function () {
        $payer = User::factory()->create();
        $debtor = User::factory()->create();
        $data = setupGroupWithSplits($payer, $debtor, 300.00);

        $response = $this->actingAs($debtor)
            ->postJson("/api/v1/settlements/{$data['settlement']->id}/settle");

        $response->assertOk()
            ->assertJsonPath('message', 'Settlement marked as paid.')
            ->assertJsonPath('data.status', 'settled');

        $this->assertDatabaseHas('settlements', [
            'id' => $data['settlement']->id,
            'status' => 'settled',
        ]);
    });

    it('returns 403 when requester is not the payer', function () {
        $payer = User::factory()->create();
        $debtor = User::factory()->create();
        $outsider = User::factory()->create();
        $data = setupGroupWithSplits($payer, $debtor);

        $this->actingAs($outsider)
            ->postJson("/api/v1/settlements/{$data['settlement']->id}/settle")
            ->assertForbidden();
    });

    it('returns 403 when the creditor tries to settle (not the debtor)', function () {
        $payer = User::factory()->create();
        $debtor = User::factory()->create();
        $data = setupGroupWithSplits($payer, $debtor);

        // payer is the *to_user*, not the from_user — should be 403
        $this->actingAs($payer)
            ->postJson("/api/v1/settlements/{$data['settlement']->id}/settle")
            ->assertForbidden();
    });

    it('returns 422 when settlement is already settled', function () {
        $payer = User::factory()->create();
        $debtor = User::factory()->create();
        $data = setupGroupWithSplits($payer, $debtor);

        // Settle it once
        $this->actingAs($debtor)
            ->postJson("/api/v1/settlements/{$data['settlement']->id}/settle");

        // Try again
        $this->actingAs($debtor)
            ->postJson("/api/v1/settlements/{$data['settlement']->id}/settle")
            ->assertUnprocessable();
    });

    it('returns 404 when settlement does not exist', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/settlements/999/settle')
            ->assertNotFound();
    });

    it('returns 401 when unauthenticated', function () {
        $this->postJson('/api/v1/settlements/1/settle')->assertUnauthorized();
    });
});
