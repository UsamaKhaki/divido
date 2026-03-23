<?php

namespace Database\Factories;

use App\Models\Settlement;
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
            'group_id'   => \App\Models\Group::factory(),
            'from_user'  => \App\Models\User::factory(),
            'to_user'    => \App\Models\User::factory(),
            'amount'     => $this->faker->randomFloat(2, 50, 2000),
            'status'     => 'pending',
            'settled_at' => null,
        ];
    }
}
