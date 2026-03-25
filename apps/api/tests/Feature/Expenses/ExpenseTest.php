<?php

use App\Models\Expense;
use App\Models\ExpenseItem;
use App\Models\Group;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('GET /api/v1/groups/{group}/expenses', function () {

    it('returns paginated expenses for a group member', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create(['created_by' => $user->id]);
        $group->members()->attach($user->id);

        Expense::factory()->count(3)->create(['group_id' => $group->id, 'paid_by' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/v1/groups/{$group->id}/expenses");

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    });

    it('returns 403 when not a group member', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create();

        $this->actingAs($user)
            ->getJson("/api/v1/groups/{$group->id}/expenses")
            ->assertForbidden();
    });

    it('returns 404 when group does not exist', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/groups/999/expenses')
            ->assertNotFound();
    });

});

describe('POST /api/v1/expenses', function () {

    it('creates an expense with items and returns 201', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create(['created_by' => $user->id]);
        $group->members()->attach($user->id);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/expenses', [
                'group_id' => $group->id,
                'title' => 'Dinner',
                'total_amount' => 1200.00,
                'category' => 'food',
                'items' => [
                    ['name' => 'Sheesha', 'price' => 600.00, 'quantity' => 1],
                    ['name' => 'Drinks',  'price' => 600.00, 'quantity' => 2],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Dinner')
            ->assertJsonPath('data.category', 'food')
            ->assertJsonCount(2, 'data.items');

        $this->assertDatabaseHas('expenses', ['title' => 'Dinner', 'group_id' => $group->id]);
        $this->assertDatabaseHas('expense_items', ['name' => 'Sheesha']);
    });

    it('creates an expense without items', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create(['created_by' => $user->id]);
        $group->members()->attach($user->id);

        $this->actingAs($user)
            ->postJson('/api/v1/expenses', [
                'group_id' => $group->id,
                'title' => 'Taxi',
                'total_amount' => 200.00,
            ])->assertCreated()
            ->assertJsonPath('data.title', 'Taxi');
    });

    it('returns 403 when not a group member', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/expenses', [
                'group_id' => $group->id,
                'title' => 'Test',
                'total_amount' => 100.00,
            ])->assertForbidden();
    });

    it('returns 422 when required fields are missing', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/expenses', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['group_id', 'title', 'total_amount']);
    });

    it('returns 422 for invalid category', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create(['created_by' => $user->id]);
        $group->members()->attach($user->id);

        $this->actingAs($user)
            ->postJson('/api/v1/expenses', [
                'group_id' => $group->id,
                'title' => 'Test',
                'total_amount' => 100.00,
                'category' => 'invalid-category',
            ])->assertUnprocessable()
            ->assertJsonValidationErrors(['category']);
    });

    it('returns 401 when unauthenticated', function () {
        $this->postJson('/api/v1/expenses', [])->assertUnauthorized();
    });

});

describe('GET /api/v1/expenses/{expense}', function () {

    it('returns expense details for a group member', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create(['created_by' => $user->id]);
        $group->members()->attach($user->id);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id]);
        ExpenseItem::factory()->create(['expense_id' => $expense->id]);

        $this->actingAs($user)
            ->getJson("/api/v1/expenses/{$expense->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $expense->id)
            ->assertJsonStructure(['data' => ['id', 'title', 'total_amount', 'paid_by', 'items']]);
    });

    it('returns 403 when not a group member', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create();
        $expense = Expense::factory()->create(['group_id' => $group->id]);

        $this->actingAs($user)
            ->getJson("/api/v1/expenses/{$expense->id}")
            ->assertForbidden();
    });

    it('returns 404 when expense does not exist', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/expenses/999')
            ->assertNotFound();
    });

});

describe('DELETE /api/v1/expenses/{expense}', function () {

    it('allows creator to delete expense', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create(['created_by' => $user->id]);
        $group->members()->attach($user->id);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id]);

        $this->actingAs($user)
            ->deleteJson("/api/v1/expenses/{$expense->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Expense deleted successfully.');

        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
    });

    it('returns 403 when not the creator', function () {
        $user = User::factory()->create();
        $creator = User::factory()->create();
        $group = Group::factory()->create(['created_by' => $creator->id]);
        $group->members()->attach([$creator->id, $user->id]);
        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $creator->id]);

        $this->actingAs($user)
            ->deleteJson("/api/v1/expenses/{$expense->id}")
            ->assertForbidden();
    });

    it('returns 404 when expense does not exist', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->deleteJson('/api/v1/expenses/999')
            ->assertNotFound();
    });

});
