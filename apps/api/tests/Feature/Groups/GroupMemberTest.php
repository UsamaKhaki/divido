<?php

use App\Models\Group;
use App\Models\User;
use Tests\TestCase;

uses(TestCase::class, \Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('POST /api/v1/groups/{group}/members', function () {

    it('adds a member to the group by email', function () {
        $creator = User::factory()->create();
        $newUser = User::factory()->create();
        $group   = Group::factory()->create(['created_by' => $creator->id]);
        $group->members()->attach($creator->id);

        $this->actingAs($creator)
            ->postJson("/api/v1/groups/{$group->id}/members", ['email' => $newUser->email])
            ->assertOk()
            ->assertJsonPath('data.id', $newUser->id)
            ->assertJsonPath('message', 'Member added successfully.');

        $this->assertDatabaseHas('group_user', ['group_id' => $group->id, 'user_id' => $newUser->id]);
    });

    it('returns 422 when user is already a member', function () {
        $creator = User::factory()->create();
        $group   = Group::factory()->create(['created_by' => $creator->id]);
        $group->members()->attach($creator->id);

        $this->actingAs($creator)
            ->postJson("/api/v1/groups/{$group->id}/members", ['email' => $creator->email])
            ->assertStatus(422);
    });

    it('returns 422 when email does not exist', function () {
        $creator = User::factory()->create();
        $group   = Group::factory()->create(['created_by' => $creator->id]);
        $group->members()->attach($creator->id);

        $this->actingAs($creator)
            ->postJson("/api/v1/groups/{$group->id}/members", ['email' => 'nobody@nowhere.com'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });

    it('returns 403 when requester is not a member', function () {
        $stranger = User::factory()->create();
        $newUser  = User::factory()->create();
        $group    = Group::factory()->create();

        $this->actingAs($stranger)
            ->postJson("/api/v1/groups/{$group->id}/members", ['email' => $newUser->email])
            ->assertForbidden();
    });

    it('returns 404 when group does not exist', function () {
        $user    = User::factory()->create();
        $newUser = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/groups/999/members', ['email' => $newUser->email])
            ->assertNotFound();
    });

});

describe('DELETE /api/v1/groups/{group}/members/{user}', function () {

    it('allows creator to remove another member', function () {
        $creator = User::factory()->create();
        $member  = User::factory()->create();
        $group   = Group::factory()->create(['created_by' => $creator->id]);
        $group->members()->attach([$creator->id, $member->id]);

        $this->actingAs($creator)
            ->deleteJson("/api/v1/groups/{$group->id}/members/{$member->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Member removed successfully.');

        $this->assertDatabaseMissing('group_user', ['group_id' => $group->id, 'user_id' => $member->id]);
    });

    it('allows a member to remove themselves', function () {
        $creator = User::factory()->create();
        $member  = User::factory()->create();
        $group   = Group::factory()->create(['created_by' => $creator->id]);
        $group->members()->attach([$creator->id, $member->id]);

        $this->actingAs($member)
            ->deleteJson("/api/v1/groups/{$group->id}/members/{$member->id}")
            ->assertOk();
    });

    it('returns 403 when non-creator tries to remove another member', function () {
        $creator = User::factory()->create();
        $member1 = User::factory()->create();
        $member2 = User::factory()->create();
        $group   = Group::factory()->create(['created_by' => $creator->id]);
        $group->members()->attach([$creator->id, $member1->id, $member2->id]);

        $this->actingAs($member1)
            ->deleteJson("/api/v1/groups/{$group->id}/members/{$member2->id}")
            ->assertForbidden();
    });

    it('returns 404 when group does not exist', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->deleteJson('/api/v1/groups/999/members/1')
            ->assertNotFound();
    });

});
