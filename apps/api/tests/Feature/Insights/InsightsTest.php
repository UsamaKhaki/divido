<?php

use App\Models\Expense;
use App\Models\ExpenseItem;
use App\Models\Group;
use App\Models\ItemSplit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('GET /api/v1/groups/{group}/insights', function () {

    it('returns 401 for unauthenticated requests', function () {
        $group = Group::factory()->create();

        $this->getJson("/api/v1/groups/{$group->id}/insights")
            ->assertUnauthorized();
    });

    it('returns 404 when group does not exist', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/groups/999/insights')
            ->assertNotFound();
    });

    it('returns 403 when user is not a group member', function () {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $group = Group::factory()
            ->hasAttached([$owner], [], 'members')
            ->create(['created_by' => $owner->id]);

        $this->actingAs($outsider)
            ->getJson("/api/v1/groups/{$group->id}/insights")
            ->assertForbidden();
    });

    it('returns zeroed insights for a group with no expenses', function () {
        $user = User::factory()->create();
        $group = Group::factory()
            ->hasAttached([$user], [], 'members')
            ->create(['created_by' => $user->id]);

        $this->actingAs($user)
            ->getJson("/api/v1/groups/{$group->id}/insights")
            ->assertOk()
            ->assertJsonPath('data.total_group_spend', 0)
            ->assertJsonPath('data.spent_per_user', [])
            ->assertJsonPath('data.category_breakdown', []);
    });

    it('returns correct total_group_spend', function () {
        $user = User::factory()->create();
        $group = Group::factory()
            ->hasAttached([$user], [], 'members')
            ->create(['created_by' => $user->id]);

        Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id, 'total_amount' => 100, 'category' => 'food']);
        Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id, 'total_amount' => 250, 'category' => 'transport']);

        $this->actingAs($user)
            ->getJson("/api/v1/groups/{$group->id}/insights")
            ->assertOk()
            ->assertJsonPath('data.total_group_spend', 350);
    });

    it('returns correct category_breakdown', function () {
        $user = User::factory()->create();
        $group = Group::factory()
            ->hasAttached([$user], [], 'members')
            ->create(['created_by' => $user->id]);

        Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id, 'total_amount' => 150, 'category' => 'food']);
        Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id, 'total_amount' => 50,  'category' => 'food']);
        Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id, 'total_amount' => 200, 'category' => 'transport']);

        $response = $this->actingAs($user)
            ->getJson("/api/v1/groups/{$group->id}/insights")
            ->assertOk();

        $breakdown = collect($response->json('data.category_breakdown'));

        $food = $breakdown->firstWhere('category', 'food');
        $transport = $breakdown->firstWhere('category', 'transport');

        expect($food['total'])->toEqual(200)
            ->and($transport['total'])->toEqual(200);
    });

    it('returns correct spent_per_user from item splits', function () {
        $user1 = User::factory()->create(['name' => 'Alice']);
        $user2 = User::factory()->create(['name' => 'Bob']);
        $group = Group::factory()
            ->hasAttached([$user1, $user2], [], 'members')
            ->create(['created_by' => $user1->id]);

        $expense = Expense::factory()->create([
            'group_id' => $group->id,
            'paid_by' => $user1->id,
            'total_amount' => 300,
            'category' => 'food',
        ]);

        $item = ExpenseItem::factory()->create([
            'expense_id' => $expense->id,
            'price' => 300,
            'quantity' => 1,
        ]);

        ItemSplit::factory()->create(['expense_item_id' => $item->id, 'user_id' => $user1->id, 'amount' => 200]);
        ItemSplit::factory()->create(['expense_item_id' => $item->id, 'user_id' => $user2->id, 'amount' => 100]);

        $response = $this->actingAs($user1)
            ->getJson("/api/v1/groups/{$group->id}/insights")
            ->assertOk();

        $spentPerUser = collect($response->json('data.spent_per_user'));

        $alice = $spentPerUser->firstWhere('user.name', 'Alice');
        $bob = $spentPerUser->firstWhere('user.name', 'Bob');

        expect($alice['total'])->toEqual(200)
            ->and($bob['total'])->toEqual(100);
    });

    it('does not include expenses from other groups', function () {
        $user = User::factory()->create();
        $group = Group::factory()->hasAttached([$user], [], 'members')->create(['created_by' => $user->id]);
        $otherGroup = Group::factory()->hasAttached([$user], [], 'members')->create(['created_by' => $user->id]);

        Expense::factory()->create(['group_id' => $group->id,      'paid_by' => $user->id, 'total_amount' => 100, 'category' => 'food']);
        Expense::factory()->create(['group_id' => $otherGroup->id, 'paid_by' => $user->id, 'total_amount' => 999, 'category' => 'food']);

        $this->actingAs($user)
            ->getJson("/api/v1/groups/{$group->id}/insights")
            ->assertOk()
            ->assertJsonPath('data.total_group_spend', 100);
    });
});
