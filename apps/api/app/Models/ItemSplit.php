<?php

namespace App\Models;

use Database\Factories\ItemSplitFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemSplit extends Model
{
    /** @use HasFactory<ItemSplitFactory> */
    use HasFactory;

    protected static function newFactory(): ItemSplitFactory
    {
        return ItemSplitFactory::new();
    }

    protected $fillable = [
        'expense_item_id',
        'user_id',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function expenseItem(): BelongsTo
    {
        return $this->belongsTo(ExpenseItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
