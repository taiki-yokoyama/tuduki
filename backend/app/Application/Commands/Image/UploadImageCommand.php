<?php

declare(strict_types=1);

namespace App\Application\Commands\Image;

use Illuminate\Http\UploadedFile;

final readonly class UploadImageCommand
{
    public function __construct(
        public UploadedFile $file,
    ) {
    }
}
