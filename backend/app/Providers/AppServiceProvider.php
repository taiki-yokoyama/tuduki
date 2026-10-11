<?php

namespace App\Providers;

use App\Application\Ports\ImageStorage;
use App\Domain\Repositories\DiaryImageRepository;
use App\Domain\Repositories\GroupRepository;
use App\Domain\Repositories\DiaryRepository;
use App\Domain\Repositories\PersonRepository;
use App\Infrastructure\Persistence\Repositories\DbDiaryRepository;
use App\Infrastructure\Persistence\Repositories\DbDiaryImageRepository;
use App\Infrastructure\Persistence\Repositories\DbGroupRepository;
use App\Infrastructure\Persistence\Repositories\DbPersonRepository;
use App\Infrastructure\Storage\PublicImageStorage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(DiaryRepository::class, DbDiaryRepository::class);
        $this->app->bind(DiaryImageRepository::class, DbDiaryImageRepository::class);
        $this->app->bind(GroupRepository::class, DbGroupRepository::class);
        $this->app->bind(ImageStorage::class, PublicImageStorage::class);
        $this->app->bind(PersonRepository::class, DbPersonRepository::class);
    }

    public function boot(): void
    {
        // Application bootstrapping can be added here.
    }
}
