<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\ServiceProvider;

return [
    'name' => env('APP_NAME', 'Tuduki'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => 'Asia/Tokyo',
    'locale' => 'ja',
    'fallback_locale' => 'en',
    'faker_locale' => 'ja_JP',
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY'),
    'previous_keys' => [
        ...array_filter(explode(',', (string) env('APP_PREVIOUS_KEYS', ''))),
    ],
    'maintenance' => [
        'driver' => 'file',
        'store' => 'database',
    ],
    'providers' => ServiceProvider::defaultProviders()->merge([
        App\Providers\AppServiceProvider::class,
        Laravel\Sanctum\SanctumServiceProvider::class,
    ])->toArray(),
];
