<?php

use App\Http\Controllers\Api\DiaryController;
use App\Http\Controllers\Api\HealthController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);
Route::apiResource('diaries', DiaryController::class);
