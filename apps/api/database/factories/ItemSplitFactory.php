<?php

namespace Database\Factories;

use App\Models\ItemSplit;
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
            'expense_item_id' => \App\Models\ExpenseItem::factory(),
            'user_id'         => \App\Models\User::factory(),
            'amount'          => $this->faker->randomFloat(2, 10, 500),
        ];
    }
}
