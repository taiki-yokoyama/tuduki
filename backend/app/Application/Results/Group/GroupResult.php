<?php

declare(strict_types=1);

namespace App\Application\Results\Group;

use App\Domain\Models\Group;

final readonly class GroupResult
{
    public function __construct(
        public Group $group,
    ) {
    }
}
