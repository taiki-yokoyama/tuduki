<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\Commands\Diary\CreateDiaryCommand;
use App\Application\Commands\Diary\DiaryImageCommand;
use App\Application\Commands\Diary\UpdateDiaryCommand;
use App\Application\Queries\Diary\ListDiariesQuery;
use App\Application\UseCases\Diary\CreateDiaryUseCase;
use App\Application\UseCases\Diary\DeleteDiaryUseCase;
use App\Application\UseCases\Diary\GetDiaryUseCase;
use App\Application\UseCases\Diary\ListDiariesUseCase;
use App\Application\UseCases\Diary\UpdateDiaryUseCase;
use App\Http\Mappers\DiaryMapper;
use App\Http\Requests\Api\DiaryCreateRequest;
use App\Http\Requests\Api\DiaryIndexRequest;
use App\Http\Requests\Api\DiaryUpdateRequest;
use DateTimeImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class DiaryController
{
    public function __construct(
        private DiaryMapper $diaryMapper,
    ) {
    }

    public function index(DiaryIndexRequest $request, ListDiariesUseCase $useCase): JsonResponse
    {
        $userId = (int) $request->user()->getAuthIdentifier();
        $validated = $request->validated();
        $query = new ListDiariesQuery(
            userId: $userId,
            personId: isset($validated['person_id']) ? (int) $validated['person_id'] : null,
            startDate: isset($validated['start_date'])
                ? new DateTimeImmutable($validated['start_date'])
                : null,
            endDate: isset($validated['end_date'])
                ? new DateTimeImmutable($validated['end_date'])
                : null,
        );
        $diaryResults = $useCase->execute($query);
        $diaries = $this->diaryMapper->toList($diaryResults);

        return response()->json($diaries);
    }

    public function store(DiaryCreateRequest $request, CreateDiaryUseCase $useCase): JsonResponse
    {
        $userId = (int) $request->user()->getAuthIdentifier();
        $validated = $request->validated();
        $personIds = array_map('intval', $validated['person_ids'] ?? []);
        $images = array_map(
            fn (array $image): DiaryImageCommand => new DiaryImageCommand(
                storagePath: $image['storage_path'],
                displayOrder: (int) ($image['display_order'] ?? 0),
            ),
            $validated['images'] ?? [],
        );
        $command = new CreateDiaryCommand(
            content: $validated['content'],
            diaryDate: new DateTimeImmutable($validated['diary_date']),
            personIds: $personIds,
            images: $images,
        );
        $diaryResult = $useCase->execute($userId, $command);
        $diary = $this->diaryMapper->toArray($diaryResult);

        return response()->json($diary, 201);
    }

    public function show(Request $request, int $diary, GetDiaryUseCase $useCase): JsonResponse
    {
        $userId = (int) $request->user()->getAuthIdentifier();
        $diaryResult = $useCase->execute($userId, $diary);
        $diaryData = $this->diaryMapper->toArray($diaryResult);

        return response()->json($diaryData);
    }

    public function update(
        DiaryUpdateRequest $request,
        int $diary,
        UpdateDiaryUseCase $useCase,
    ): JsonResponse {
        $userId = (int) $request->user()->getAuthIdentifier();
        $validated = $request->validated();
        $command = new UpdateDiaryCommand(
            hasContent: array_key_exists('content', $validated),
            content: $validated['content'] ?? null,
            hasDiaryDate: array_key_exists('diary_date', $validated),
            diaryDate: isset($validated['diary_date'])
                ? new DateTimeImmutable($validated['diary_date'])
                : null,
            hasPersonIds: array_key_exists('person_ids', $validated),
            personIds: array_key_exists('person_ids', $validated)
                ? array_map('intval', $validated['person_ids'])
                : null,
        );
        $diaryResult = $useCase->execute($userId, $diary, $command);
        $diaryData = $this->diaryMapper->toArray($diaryResult);

        return response()->json($diaryData);
    }

    public function destroy(Request $request, int $diary, DeleteDiaryUseCase $useCase): Response
    {
        $userId = (int) $request->user()->getAuthIdentifier();
        $useCase->execute($userId, $diary);

        return response()->noContent();
    }
}
