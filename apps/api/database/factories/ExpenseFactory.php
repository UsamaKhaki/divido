<?php

namespace Database\Factories;

use App\Models\Expense;
use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'group_id' => Group::factory(),
            'paid_by' => User::factory(),
            'title' => $this->faker->words(3, true),
            'total_amount' => $this->faker->randomFloat(2, 10, 5000),
            'category' => $this->faker->randomElement(['food', 'transport', 'accommodation', 'entertainment', 'shopping', 'other']),
        ];
    }
}
