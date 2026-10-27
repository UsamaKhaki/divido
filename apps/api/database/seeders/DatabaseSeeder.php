<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Two local demo accounts, so splits and settlements can be tried between
     * real users. Both use the factory password: "password".
     */
    public function run(): void
    {
        foreach (['Alice' => 'alice@divido.test', 'Bob' => 'bob@divido.test'] as $name => $email) {
            if (! User::where('email', $email)->exists()) {
                User::factory()->create(['name' => $name, 'email' => $email]);
            }
        }
    }
}
