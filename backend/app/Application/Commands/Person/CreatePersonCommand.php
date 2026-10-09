<?php

declare(strict_types=1);

namespace App\Application\Commands\Person;

final readonly class CreatePersonCommand
{
    public function __construct(
        public string $name,
        public ?int $groupId,
        public ?string $notes,
        public string $avatarColor,
        public ?string $imageUrl,
    ) {
    }
}
