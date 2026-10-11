<?php

declare(strict_types=1);

namespace App\Application\Queries\Diary;

use DateTimeImmutable;

final readonly class ListDiariesQuery
{
    public function __construct(
        public int $userId,
        public ?int $personId = null,
        public ?DateTimeImmutable $startDate = null,
        public ?DateTimeImmutable $endDate = null,
    ) {
    }
}
