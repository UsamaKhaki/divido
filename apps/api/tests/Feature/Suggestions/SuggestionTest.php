<?php

use App\Models\Expense;
use App\Models\ExpenseItem;
use App\Models\Group;
use App\Models\ItemSplit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('GET /api/v1/groups/{group}/suggestions', function () {

    it('returns 401 for unauthenticated requests', function () {
        $group = Group::factory()->create();

        $this->getJson("/api/v1/groups/{$group->id}/suggestions?items=Sheesha")
            ->assertUnauthorized();
    });

    it('returns 404 when group does not exist', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/groups/999/suggestions?items=Sheesha')
            ->assertNotFound();
    });

    it('returns 403 when user is not a group member', function () {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $group = Group::factory()->hasAttached([$owner], [], 'members')->create(['created_by' => $owner->id]);

        $this->actingAs($outsider)
            ->getJson("/api/v1/groups/{$group->id}/suggestions?items=Sheesha")
            ->assertForbidden();
    });

    it('returns empty array when no items param is provided', function () {
        $user = User::factory()->create();
        $group = Group::factory()->hasAttached([$user], [], 'members')->create(['created_by' => $user->id]);

        $this->actingAs($user)
            ->getJson("/api/v1/groups/{$group->id}/suggestions")
            ->assertOk()
            ->assertJsonPath('data', []);
    });

    it('returns empty suggested_users when there is no split history', function () {
        $user = User::factory()->create();
        $group = Group::factory()->hasAttached([$user], [], 'members')->create(['created_by' => $user->id]);

        $this->actingAs($user)
            ->getJson("/api/v1/groups/{$group->id}/suggestions?items=Sheesha")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.item_name', 'Sheesha')
            ->assertJsonPath('data.0.suggested_users', []);
    });

    it('returns suggested users ordered by confidence based on split history', function () {
        $user1 = User::factory()->create(['name' => 'Usama Khaki']);
        $user2 = User::factory()->create(['name' => 'Waqas Ali']);
        $group = Group::factory()
            ->hasAttached([$user1, $user2], [], 'members')
            ->create(['created_by' => $user1->id]);

        // Create 3 expenses where Sheesha was split: user1 assigned twice, user2 once
        foreach (range(1, 3) as $i) {
            $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user1->id]);
            $item = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'name' => 'Sheesha', 'price' => 100, 'quantity' => 1]);

            $assignedUser = $i <= 2 ? $user1 : $user2;
            ItemSplit::factory()->create([
                'expense_item_id' => $item->id,
                'user_id' => $assignedUser->id,
                'amount' => 100.00,
            ]);
        }

        $response = $this->actingAs($user1)
            ->getJson("/api/v1/groups/{$group->id}/suggestions?items=Sheesha")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.item_name', 'Sheesha');

        $suggestedUsers = $response->json('data.0.suggested_users');
        expect($suggestedUsers)->toHaveCount(2);

        // Usama has 2/3 confidence, Waqas has 1/3
        expect($suggestedUsers[0]['user']['name'])->toBe('Usama Khaki');
        expect($suggestedUsers[0]['confidence'])->toBe(0.67);
        expect($suggestedUsers[1]['user']['name'])->toBe('Waqas Ali');
        expect($suggestedUsers[1]['confidence'])->toBe(0.33);
    });

    it('returns suggestions for multiple items in one request', function () {
        $user = User::factory()->create();
        $group = Group::factory()->hasAttached([$user], [], 'members')->create(['created_by' => $user->id]);

        $expense = Expense::factory()->create(['group_id' => $group->id, 'paid_by' => $user->id]);

        foreach (['Sheesha', 'Drinks'] as $name) {
            $item = ExpenseItem::factory()->create(['expense_id' => $expense->id, 'name' => $name, 'price' => 100, 'quantity' => 1]);
            ItemSplit::factory()->create(['expense_item_id' => $item->id, 'user_id' => $user->id, 'amount' => 100.00]);
        }

        $this->actingAs($user)
            ->getJson("/api/v1/groups/{$group->id}/suggestions?items=Sheesha,Drinks")
            ->assertOk()
            ->assertJsonCount(2, 'data');
    });
});
