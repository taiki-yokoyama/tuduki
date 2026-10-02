<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Application services can be registered here.
    }

    public function boot(): void
    {
        // Application bootstrapping can be added here.
    }
}
