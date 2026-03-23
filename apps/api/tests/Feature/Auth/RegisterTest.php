<?php

use App\Models\User;
use Tests\TestCase;

uses(TestCase::class, \Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('POST /api/v1/auth/register', function () {

    it('creates an account and returns 201 with token and user', function () {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Usama Khaki',
            'email'                 => 'usama@example.com',
            'password'              => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['data' => ['token', 'user' => ['id', 'name', 'email']], 'message'])
            ->assertJsonPath('data.user.email', 'usama@example.com');

        $this->assertDatabaseHas('users', ['email' => 'usama@example.com']);
    });

    it('returns 422 when email is already taken', function () {
        User::factory()->create(['email' => 'usama@example.com']);

        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Usama Khaki',
            'email'                 => 'usama@example.com',
            'password'              => 'secret123',
            'password_confirmation' => 'secret123',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });

    it('returns 422 when required fields are missing', function () {
        $this->postJson('/api/v1/auth/register', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    });

    it('returns 422 when passwords do not match', function () {
        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Usama Khaki',
            'email'                 => 'usama@example.com',
            'password'              => 'secret123',
            'password_confirmation' => 'different',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    });

});
