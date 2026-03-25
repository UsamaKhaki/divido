<?php

use App\Models\Expense;
use App\Models\ExpenseItem;
use App\Models\Group;
use App\Models\ItemSplit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('GET /api/v1/expenses/{expense}/summary', function () {

    it('returns 401 for unauthenticated requests', function () {
        $expense = Expense::factory()->create();

        $this->getJson("/api/v1/expenses/{$expense->id}/summary")
            ->assertUnauthorized();
    });

    it('returns 404 when expense does not exist', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/expenses/999/summary')
            ->assertNotFound();
    });

    it('returns 403 when user is not a group member', function () {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $group = Group::factory()->hasAttached([$owner], [], 'members')->create(['created_by' => $owner->id]);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $owner->id]);

        $this->actingAs($outsider)
            ->getJson("/api/v1/expenses/{$expense->id}/summary")
            ->assertForbidden();
    });

    it('returns 200 with a summary string for an expense with splits', function () {
        $payer = User::factory()->create(['name' => 'Usama Khaki']);
        $debtor = User::factory()->create(['name' => 'Waqas Ali']);
        $group = Group::factory()
            ->hasAttached([$payer, $debtor], [], 'members')
            ->create(['created_by' => $payer->id, 'name' => 'Weekend Trip']);
        $expense = Expense::factory()->create([
            'group_id' => $group->id,
            'paid_by' => $payer->id,
            'title' => 'Dinner',
            'total_amount' => 1200.00,
        ]);
        $item = ExpenseItem::factory()->create([
            'expense_id' => $expense->id,
            'price' => 300.00,
            'quantity' => 1,
        ]);
        ItemSplit::factory()->create([
            'expense_item_id' => $item->id,
            'user_id' => $debtor->id,
            'amount' => 300.00,
        ]);

        $response = $this->actingAs($payer)
            ->getJson("/api/v1/expenses/{$expense->id}/summary")
            ->assertOk();

        $summary = $response->json('data.summary');
        expect($summary)->toContain('Weekend Trip')
            ->toContain('Dinner')
            ->toContain('1,200')
            ->toContain('Usama Khaki paid')
            ->toContain('Waqas Ali owes PKR 300')
            ->toContain('Settled via Divido');
    });

    it('returns 200 with a summary when no splits exist', function () {
        $user = User::factory()->create(['name' => 'Usama Khaki']);
        $group = Group::factory()->hasAttached([$user], [], 'members')->create(['created_by' => $user->id, 'name' => 'Solo']);
        $expense = Expense::factory()->create([
            'group_id' => $group->id,
            'paid_by' => $user->id,
            'title' => 'Coffee',
            'total_amount' => 500.00,
        ]);

        $this->actingAs($user)
            ->getJson("/api/v1/expenses/{$expense->id}/summary")
            ->assertOk()
            ->assertJsonPath('data.summary', fn ($v) => str_contains($v, 'Usama Khaki paid'));
    });
});
