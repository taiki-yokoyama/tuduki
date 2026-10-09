<?php

declare(strict_types=1);

namespace App\Application\Commands\Group;

final readonly class CreateGroupCommand
{
    public function __construct(
        public string $name,
        public string $color,
        public int $sortOrder,
    ) {
    }
}
