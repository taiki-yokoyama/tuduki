<?php

declare(strict_types=1);

namespace App\Application\Commands\Diary;

use DateTimeImmutable;

final readonly class CreateDiaryCommand
{
    /**
     * @param list<int> $personIds
     * @param list<DiaryImageCommand> $images
     */
    public function __construct(
        public string $content,
        public DateTimeImmutable $diaryDate,
        public array $personIds,
        public array $images,
    ) {
    }
}
