<?php

namespace Database\Factories;

use App\Models\ExpenseItem;
use App\Models\ItemSplit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ItemSplit>
 */
class ItemSplitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'expense_item_id' => ExpenseItem::factory(),
            'user_id' => User::factory(),
            'amount' => $this->faker->randomFloat(2, 10, 500),
        ];
    }
}
