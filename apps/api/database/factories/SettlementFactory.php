<?php

namespace Database\Factories;

use App\Models\Group;
use App\Models\Settlement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Settlement>
 */
class SettlementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'group_id' => Group::factory(),
            'from_user' => User::factory(),
            'to_user' => User::factory(),
            'amount' => $this->faker->randomFloat(2, 50, 2000),
            'status' => 'pending',
            'settled_at' => null,
        ];
    }
}
