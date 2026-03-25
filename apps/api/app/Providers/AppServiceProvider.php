<?php

namespace App\Providers;

use App\Repositories\ExpenseRepository;
use App\Repositories\GroupRepository;
use App\Repositories\InsightsRepository;
use App\Repositories\ItemSplitRepository;
use App\Repositories\SettlementRepository;
use App\Repositories\SuggestionsRepository;
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
        $this->app->singleton(ItemSplitRepository::class);
        $this->app->singleton(SettlementRepository::class);
        $this->app->singleton(SuggestionsRepository::class);
        $this->app->singleton(InsightsRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
