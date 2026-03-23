<?php

use App\Models\User;
use Tests\TestCase;

uses(TestCase::class, \Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('POST /api/v1/auth/logout', function () {

    it('revokes the token and returns 200', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');
    });

    it('returns 401 when unauthenticated', function () {
        $this->postJson('/api/v1/auth/logout')
            ->assertUnauthorized();
    });

});

describe('GET /api/v1/auth/me', function () {

    it('returns the authenticated user', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email);
    });

    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
    });

});
