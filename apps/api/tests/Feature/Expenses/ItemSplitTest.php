<?php

use App\Models\Expense;
use App\Models\ExpenseItem;
use App\Models\Group;
use App\Models\User;
use Tests\TestCase;

uses(TestCase::class, \Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('PUT /api/v1/expenses/{expense}/items/{item}/splits', function () {

    it('assigns splits to an item and returns 200', function () {
        $user    = User::factory()->create();
        $user2   = User::factory()->create();
        $group   = Group::factory()->hasAttached([$user, $user2], [], 'members')->create(['created_by' => $user->id]);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id]);
        $item    = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'price' => 300.00, 'quantity' => 1]);

        $response = $this->actingAs($user)
            ->putJson("/api/v1/expenses/{$expense->id}/items/{$item->id}/splits", [
                'splits' => [
                    ['user_id' => $user->id,  'amount' => 150.00],
                    ['user_id' => $user2->id, 'amount' => 150.00],
                ],
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Splits updated successfully.')
            ->assertJsonPath('data.item_id', $item->id)
            ->assertJsonCount(2, 'data.splits');

        $this->assertDatabaseHas('item_splits', ['expense_item_id' => $item->id, 'user_id' => $user->id,  'amount' => 150.00]);
        $this->assertDatabaseHas('item_splits', ['expense_item_id' => $item->id, 'user_id' => $user2->id, 'amount' => 150.00]);
    });

    it('replaces existing splits on re-submission', function () {
        $user    = User::factory()->create();
        $user2   = User::factory()->create();
        $user3   = User::factory()->create();
        $group   = Group::factory()->hasAttached([$user, $user2, $user3], [], 'members')->create(['created_by' => $user->id]);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id]);
        $item    = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'price' => 600.00, 'quantity' => 1]);

        // First submission
        $this->actingAs($user)
            ->putJson("/api/v1/expenses/{$expense->id}/items/{$item->id}/splits", [
                'splits' => [
                    ['user_id' => $user->id,  'amount' => 300.00],
                    ['user_id' => $user2->id, 'amount' => 300.00],
                ],
            ]);

        // Replace with different split
        $this->actingAs($user)
            ->putJson("/api/v1/expenses/{$expense->id}/items/{$item->id}/splits", [
                'splits' => [
                    ['user_id' => $user->id,  'amount' => 200.00],
                    ['user_id' => $user2->id, 'amount' => 200.00],
                    ['user_id' => $user3->id, 'amount' => 200.00],
                ],
            ])
            ->assertOk()
            ->assertJsonCount(3, 'data.splits');

        $this->assertDatabaseMissing('item_splits', ['expense_item_id' => $item->id, 'amount' => 300.00]);
    });

    it('returns 422 when split amounts do not equal item total', function () {
        $user    = User::factory()->create();
        $user2   = User::factory()->create();
        $group   = Group::factory()->hasAttached([$user, $user2], [], 'members')->create(['created_by' => $user->id]);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id]);
        $item    = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'price' => 300.00, 'quantity' => 1]);

        $this->actingAs($user)
            ->putJson("/api/v1/expenses/{$expense->id}/items/{$item->id}/splits", [
                'splits' => [
                    ['user_id' => $user->id,  'amount' => 100.00],
                    ['user_id' => $user2->id, 'amount' => 100.00],
                ],
            ])
            ->assertUnprocessable();
    });

    it('returns 422 when splits array is missing', function () {
        $user    = User::factory()->create();
        $group   = Group::factory()->hasAttached($user, [], 'members')->create(['created_by' => $user->id]);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id]);
        $item    = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'price' => 300.00, 'quantity' => 1]);

        $this->actingAs($user)
            ->putJson("/api/v1/expenses/{$expense->id}/items/{$item->id}/splits", [])
            ->assertUnprocessable();
    });

    it('returns 403 when requester is not a group member', function () {
        $user    = User::factory()->create();
        $other   = User::factory()->create();
        $group   = Group::factory()->hasAttached($user, [], 'members')->create(['created_by' => $user->id]);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id]);
        $item    = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'price' => 300.00, 'quantity' => 1]);

        $this->actingAs($other)
            ->putJson("/api/v1/expenses/{$expense->id}/items/{$item->id}/splits", [
                'splits' => [['user_id' => $user->id, 'amount' => 300.00]],
            ])
            ->assertForbidden();
    });

    it('returns 404 when item does not exist', function () {
        $user    = User::factory()->create();
        $group   = Group::factory()->hasAttached($user, [], 'members')->create(['created_by' => $user->id]);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id]);

        $this->actingAs($user)
            ->putJson("/api/v1/expenses/{$expense->id}/items/999/splits", [
                'splits' => [['user_id' => $user->id, 'amount' => 100.00]],
            ])
            ->assertNotFound();
    });

    it('returns 401 when unauthenticated', function () {
        $this->putJson('/api/v1/expenses/1/items/1/splits', [])->assertUnauthorized();
    });

    it('regenerates pending settlements after split update', function () {
        $payer   = User::factory()->create();
        $debtor  = User::factory()->create();
        $group   = Group::factory()->hasAttached([$payer, $debtor], [], 'members')->create(['created_by' => $payer->id]);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $payer->id]);
        $item    = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'price' => 600.00, 'quantity' => 1]);

        $this->actingAs($payer)
            ->putJson("/api/v1/expenses/{$expense->id}/items/{$item->id}/splits", [
                'splits' => [
                    ['user_id' => $payer->id,  'amount' => 300.00],
                    ['user_id' => $debtor->id, 'amount' => 300.00],
                ],
            ])
            ->assertOk();

        $this->assertDatabaseHas('settlements', [
            'group_id'  => $group->id,
            'from_user' => $debtor->id,
            'to_user'   => $payer->id,
            'amount'    => '300.00',
            'status'    => 'pending',
        ]);
    });
});
