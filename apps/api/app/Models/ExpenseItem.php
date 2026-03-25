<?php

namespace App\Models;

use Database\Factories\ExpenseItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpenseItem extends Model
{
    /** @use HasFactory<ExpenseItemFactory> */
    use HasFactory;

    protected static function newFactory(): ExpenseItemFactory
    {
        return ExpenseItemFactory::new();
    }

    protected $fillable = [
        'expense_id',
        'name',
        'price',
        'quantity',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }

    public function splits(): HasMany
    {
        return $this->hasMany(ItemSplit::class);
    }
}
