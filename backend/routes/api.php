<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DiaryController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\PersonController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);

Route::prefix('auth')->group(function (): void {
    Route::post('/sign-up', [AuthController::class, 'signUp']);
    Route::post('/sign-in', [AuthController::class, 'signIn']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/sign-out', [AuthController::class, 'signOut']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/groups', [GroupController::class, 'index']);
    Route::post('/groups', [GroupController::class, 'store']);
    Route::delete('/groups/{group}', [GroupController::class, 'destroy'])
        ->whereNumber('group');
    Route::get('/people', [PersonController::class, 'index']);
    Route::post('/people', [PersonController::class, 'store']);
    Route::patch('/people/{person}', [PersonController::class, 'update'])
        ->whereNumber('person');
    Route::apiResource('diaries', DiaryController::class);
});
