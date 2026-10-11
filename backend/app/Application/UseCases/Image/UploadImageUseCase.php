<?php

declare(strict_types=1);

namespace App\Application\UseCases\Image;

use App\Application\Commands\Image\UploadImageCommand;
use App\Application\Ports\ImageStorage;
use App\Application\Results\Image\UploadedImageResult;

final class UploadImageUseCase
{
    public function __construct(
        private ImageStorage $imageStorage,
    ) {
    }

    public function execute(UploadImageCommand $command): UploadedImageResult
    {
        $storagePath = $this->imageStorage->store($command->file);

        return new UploadedImageResult(
            storagePath: $storagePath,
            url: $this->imageStorage->url($storagePath),
        );
    }
}
