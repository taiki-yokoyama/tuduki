<?php

declare(strict_types=1);

namespace App\Application\Commands\Diary;

final readonly class DiaryImageCommand
{
    public function __construct(
        public string $storagePath,
        public int $displayOrder,
    ) {
    }
}
