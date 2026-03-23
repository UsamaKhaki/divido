<?php

namespace App\Providers;

use App\Repositories\ExpenseRepository;
use App\Repositories\GroupRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(GroupRepository::class);
        $this->app->singleton(ExpenseRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
