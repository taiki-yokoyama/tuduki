<?php

declare(strict_types=1);

namespace App\Application\Queries\Group;

final readonly class ListGroupsQuery
{
    public function __construct(
        public int $userId,
    ) {
    }
}
