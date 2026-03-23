<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Expenses\ExpenseController;
use App\Http\Controllers\Api\Groups\GroupController;
use App\Http\Controllers\Api\Groups\GroupMemberController;
use Illuminate\Support\Facades\Route;

// ─── Public Auth Routes ───────────────────────────────────────────────────────
Route::prefix('v1/auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('login',    [AuthController::class, 'login'])->name('auth.login');
});

// ─── Protected Routes ─────────────────────────────────────────────────────────
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('auth/me',      [AuthController::class, 'me'])->name('auth.me');

    // Groups
    Route::get('groups',          [GroupController::class, 'index'])->name('groups.index');
    Route::post('groups',         [GroupController::class, 'store'])->name('groups.store');
    Route::get('groups/{group}',  [GroupController::class, 'show'])->name('groups.show');
    Route::delete('groups/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');

    // Group Members
    Route::post('groups/{group}/members',              [GroupMemberController::class, 'store'])->name('groups.members.store');
    Route::delete('groups/{group}/members/{user}',     [GroupMemberController::class, 'destroy'])->name('groups.members.destroy');

    // Expenses (group-scoped list)
    Route::get('groups/{group}/expenses', [ExpenseController::class, 'index'])->name('groups.expenses.index');

    // Expenses (standalone)
    Route::post('expenses',            [ExpenseController::class, 'store'])->name('expenses.store');
    Route::get('expenses/{expense}',   [ExpenseController::class, 'show'])->name('expenses.show');
    Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
});
