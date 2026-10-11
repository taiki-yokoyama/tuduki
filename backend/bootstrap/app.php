<?php

use App\Domain\Exceptions\GroupNameAlreadyExists;
use App\Domain\Exceptions\GroupNotFound;
use App\Domain\Exceptions\DiaryNotFound;
use App\Domain\Exceptions\InvalidPersonName;
use App\Domain\Exceptions\InvalidDiaryPersonReference;
use App\Domain\Exceptions\InvalidStoragePath;
use App\Domain\Exceptions\InvalidGroupReference;
use App\Domain\Exceptions\PersonNameAlreadyExists;
use App\Domain\Exceptions\PersonNotFound;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->redirectGuestsTo(function (Request $request): ?string {
            return $request->is('api/*') ? null : '/login';
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (PersonNotFound $exception, Request $request) {
            return response()->json(['message' => $exception->getMessage()], 404);
        });

        $exceptions->render(function (GroupNotFound $exception, Request $request) {
            return response()->json(['message' => $exception->getMessage()], 404);
        });

        $exceptions->render(function (DiaryNotFound $exception, Request $request) {
            return response()->json(['message' => $exception->getMessage()], 404);
        });

        $exceptions->render(function (InvalidGroupReference $exception, Request $request) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => ['group_id' => [$exception->getMessage()]],
            ], 422);
        });

        $exceptions->render(function (InvalidDiaryPersonReference $exception, Request $request) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => ['person_ids' => [$exception->getMessage()]],
            ], 422);
        });

        $exceptions->render(function (InvalidStoragePath $exception, Request $request) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => ['images' => [$exception->getMessage()]],
            ], 422);
        });

        $exceptions->render(function (GroupNameAlreadyExists $exception, Request $request) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => ['name' => [$exception->getMessage()]],
            ], 422);
        });

        $exceptions->render(function (PersonNameAlreadyExists $exception, Request $request) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => ['name' => [$exception->getMessage()]],
            ], 422);
        });

        $exceptions->render(function (InvalidPersonName $exception, Request $request) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => ['name' => [$exception->getMessage()]],
            ], 422);
        });

        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $throwable): bool {
            return $request->is('api/*') || $request->expectsJson();
        });
    })->create();
