<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\UseCases\Image\AttachDiaryImageUseCase;
use App\Application\UseCases\Image\DeleteDiaryImageUseCase;
use App\Application\UseCases\Image\ListDiaryImagesUseCase;
use App\Http\Mappers\ImageMapper;
use App\Http\Requests\Api\DiaryImageAttachRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class DiaryImageController
{
    public function __construct(
        private ImageMapper $imageMapper,
    ) {
    }

    public function index(Request $request, int $diary, ListDiaryImagesUseCase $useCase): JsonResponse
    {
        $userId = (int) $request->user()->getAuthIdentifier();
        $images = $useCase->execute($userId, $diary);

        return response()->json(array_map(
            fn ($image): array => $this->imageMapper->diaryImageToArray($image),
            $images,
        ));
    }

    public function store(
        DiaryImageAttachRequest $request,
        int $diary,
        AttachDiaryImageUseCase $useCase,
    ): JsonResponse {
        $userId = (int) $request->user()->getAuthIdentifier();
        $validated = $request->validated();
        $image = $useCase->execute(
            userId: $userId,
            diaryId: $diary,
            storagePath: $validated['storage_path'],
            displayOrder: (int) ($validated['display_order'] ?? 0),
        );

        return response()->json($this->imageMapper->diaryImageToArray($image), 201);
    }

    public function destroy(
        Request $request,
        int $diary,
        int $image,
        DeleteDiaryImageUseCase $useCase,
    ): Response {
        $userId = (int) $request->user()->getAuthIdentifier();
        $useCase->execute($userId, $diary, $image);

        return response()->noContent();
    }
}
