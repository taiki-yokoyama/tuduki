<?php

declare(strict_types=1);

namespace App\Application\Commands\Diary;

use DateTimeImmutable;

final readonly class UpdateDiaryCommand
{
    /**
     * @param list<int>|null $personIds
     */
    public function __construct(
        public bool $hasContent,
        public ?string $content,
        public bool $hasDiaryDate,
        public ?DateTimeImmutable $diaryDate,
        public bool $hasPersonIds,
        public ?array $personIds,
    ) {
    }
}
