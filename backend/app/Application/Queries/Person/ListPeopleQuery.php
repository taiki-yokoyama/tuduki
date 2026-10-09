<?php

declare(strict_types=1);

namespace App\Application\Queries\Person;

final readonly class ListPeopleQuery
{
    public function __construct(
        public int $userId,
        public ?int $groupId = null,
    ) {
    }
}
