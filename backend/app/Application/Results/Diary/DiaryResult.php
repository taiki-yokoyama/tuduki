<?php

declare(strict_types=1);

namespace App\Application\Results\Diary;

use App\Application\Results\Person\PersonResult;
use App\Domain\Models\Diary;

final readonly class DiaryResult
{
    /**
     * @param list<PersonResult> $people
     */
    public function __construct(
        public Diary $diary,
        public array $people,
    ) {
    }
}
