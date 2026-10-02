<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DiaryController;
use App\Http\Controllers\Api\HealthController;
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
    Route::apiResource('diaries', DiaryController::class);
});
