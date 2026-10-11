<?php

declare(strict_types=1);

namespace App\Application\Results\Image;

final readonly class UploadedImageResult
{
    public function __construct(
        public string $storagePath,
        public string $url,
    ) {
    }
}
