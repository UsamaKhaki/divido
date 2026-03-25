<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Expenses\ExpenseController;
use App\Http\Controllers\Api\Expenses\ExpenseItemSplitController;
use App\Http\Controllers\Api\Expenses\ExpenseSummaryController;
use App\Http\Controllers\Api\Expenses\SettlementController;
use App\Http\Controllers\Api\Groups\GroupController;
use App\Http\Controllers\Api\Groups\GroupInsightsController;
use App\Http\Controllers\Api\Groups\GroupMemberController;
use App\Http\Controllers\Api\Groups\GroupSettlementController;
use App\Http\Controllers\Api\Groups\GroupSuggestionController;
use App\Http\Controllers\Api\Ocr\OcrController;
use Illuminate\Support\Facades\Route;

// ─── Public Auth Routes ───────────────────────────────────────────────────────
Route::prefix('v1/auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('login', [AuthController::class, 'login'])->name('auth.login');
});

// ─── Protected Routes ─────────────────────────────────────────────────────────
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');

    // Groups
    Route::get('groups', [GroupController::class, 'index'])->name('groups.index');
    Route::post('groups', [GroupController::class, 'store'])->name('groups.store');
    Route::get('groups/{group}', [GroupController::class, 'show'])->name('groups.show');
    Route::delete('groups/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');

    // Group Members
    Route::post('groups/{group}/members', [GroupMemberController::class, 'store'])->name('groups.members.store');
    Route::delete('groups/{group}/members/{user}', [GroupMemberController::class, 'destroy'])->name('groups.members.destroy');

    // Expenses (group-scoped list)
    Route::get('groups/{group}/expenses', [ExpenseController::class, 'index'])->name('groups.expenses.index');

    // Expenses (standalone)
    Route::post('expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::get('expenses/{expense}', [ExpenseController::class, 'show'])->name('expenses.show');
    Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');

    // ─── Phase 2: Item Splits & Settlements ──────────────────────────────────────

    // Item splits
    Route::put('expenses/{expense}/items/{item}/splits', [ExpenseItemSplitController::class, 'update'])->name('expenses.items.splits.update');

    // Group settlements
    Route::get('groups/{group}/settlements', [GroupSettlementController::class, 'index'])->name('groups.settlements.index');

    // Settle a payment
    Route::post('settlements/{settlement}/settle', [SettlementController::class, 'settle'])->name('settlements.settle');

    // ─── Phase 3: OCR ────────────────────────────────────────────────────────────

    // Analyze receipt image via Google Vision proxy
    Route::post('ocr/analyze', [OcrController::class, 'analyze'])
        ->middleware('throttle:30,1')
        ->name('ocr.analyze');

    // ─── Phase 4: Smart Suggestions + Summary ────────────────────────────────────

    // Item suggestions based on past split history
    Route::get('groups/{group}/suggestions', [GroupSuggestionController::class, 'index'])->name('groups.suggestions.index');

    // Shareable expense summary
    Route::get('expenses/{expense}/summary', [ExpenseSummaryController::class, 'show'])->name('expenses.summary.show');

    // ─── Phase 5: Insights ───────────────────────────────────────────────────────

    // Group spending insights
    Route::get('groups/{group}/insights', [GroupInsightsController::class, 'show'])->name('groups.insights.show');
});
