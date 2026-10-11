<?php

namespace App\Providers;

use App\Domain\Repositories\GroupRepository;
use App\Domain\Repositories\DiaryRepository;
use App\Domain\Repositories\PersonRepository;
use App\Infrastructure\Persistence\Repositories\DbDiaryRepository;
use App\Infrastructure\Persistence\Repositories\DbGroupRepository;
use App\Infrastructure\Persistence\Repositories\DbPersonRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(DiaryRepository::class, DbDiaryRepository::class);
        $this->app->bind(GroupRepository::class, DbGroupRepository::class);
        $this->app->bind(PersonRepository::class, DbPersonRepository::class);
    }

    public function boot(): void
    {
        // Application bootstrapping can be added here.
    }
}
