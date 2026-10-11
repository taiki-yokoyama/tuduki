<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\Commands\Image\UploadImageCommand;
use App\Application\UseCases\Image\UploadImageUseCase;
use App\Http\Mappers\ImageMapper;
use App\Http\Requests\Api\ImageUploadRequest;
use Illuminate\Http\JsonResponse;

final class ImageController
{
    public function __construct(
        private ImageMapper $imageMapper,
    ) {
    }

    public function store(ImageUploadRequest $request, UploadImageUseCase $useCase): JsonResponse
    {
        $result = $useCase->execute(new UploadImageCommand($request->file('file')));

        return response()->json($this->imageMapper->uploadedToArray($result), 201);
    }
}
