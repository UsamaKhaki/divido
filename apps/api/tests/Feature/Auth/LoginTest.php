<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('POST /api/v1/auth/login', function () {

    it('returns 200 with token and user on valid credentials', function () {
        $user = User::factory()->create(['password' => bcrypt('secret123')]);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ])->assertOk()
            ->assertJsonStructure(['data' => ['token', 'user' => ['id', 'name', 'email']]])
            ->assertJsonPath('data.user.id', $user->id);
    });

    it('returns 401 on invalid credentials', function () {
        User::factory()->create(['email' => 'usama@example.com', 'password' => bcrypt('correct')]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'usama@example.com',
            'password' => 'wrong',
        ])->assertUnauthorized();
    });

    it('returns 422 when fields are missing', function () {
        $this->postJson('/api/v1/auth/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    });

});
