<?php

use App\Models\Group;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('GET /api/v1/groups', function () {

    it('returns groups the user belongs to', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create(['created_by' => $user->id]);
        $group->members()->attach($user->id);

        $other = Group::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/groups')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $group->id);
    });

    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/v1/groups')->assertUnauthorized();
    });

});

describe('POST /api/v1/groups', function () {

    it('creates a group and auto-adds creator as member', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/groups', ['name' => 'Weekend Trip']);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Weekend Trip')
            ->assertJsonPath('data.created_by', $user->id)
            ->assertJsonCount(1, 'data.members');

        $this->assertDatabaseHas('groups', ['name' => 'Weekend Trip']);
        $this->assertDatabaseHas('group_user', ['user_id' => $user->id]);
    });

    it('returns 422 when name is missing', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/groups', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    it('returns 401 when unauthenticated', function () {
        $this->postJson('/api/v1/groups', ['name' => 'Test'])->assertUnauthorized();
    });

});

describe('GET /api/v1/groups/{group}', function () {

    it('returns group details for a member', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create(['created_by' => $user->id]);
        $group->members()->attach($user->id);

        $this->actingAs($user)
            ->getJson("/api/v1/groups/{$group->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $group->id)
            ->assertJsonStructure(['data' => ['id', 'name', 'created_by', 'members']]);
    });

    it('returns 403 when not a member', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create();

        $this->actingAs($user)
            ->getJson("/api/v1/groups/{$group->id}")
            ->assertForbidden();
    });

    it('returns 404 when group does not exist', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/groups/999')
            ->assertNotFound();
    });

    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/v1/groups/1')->assertUnauthorized();
    });

});

describe('DELETE /api/v1/groups/{group}', function () {

    it('allows creator to delete the group', function () {
        $user = User::factory()->create();
        $group = Group::factory()->create(['created_by' => $user->id]);
        $group->members()->attach($user->id);

        $this->actingAs($user)
            ->deleteJson("/api/v1/groups/{$group->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Group deleted successfully.');

        $this->assertDatabaseMissing('groups', ['id' => $group->id]);
    });

    it('returns 403 when not the creator', function () {
        $creator = User::factory()->create();
        $other = User::factory()->create();
        $group = Group::factory()->create(['created_by' => $creator->id]);
        $group->members()->attach([$creator->id, $other->id]);

        $this->actingAs($other)
            ->deleteJson("/api/v1/groups/{$group->id}")
            ->assertForbidden();
    });

    it('returns 404 when group does not exist', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->deleteJson('/api/v1/groups/999')
            ->assertNotFound();
    });

});
