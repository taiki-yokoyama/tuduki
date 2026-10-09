<?php

declare(strict_types=1);

namespace App\Application\Commands\Person;

final readonly class UpdatePersonCommand
{
    public function __construct(
        public bool $hasName,
        public ?string $name,
        public bool $hasGroupId,
        public ?int $groupId,
        public bool $hasNotes,
        public ?string $notes,
        public bool $hasAvatarColor,
        public ?string $avatarColor,
        public bool $hasImageUrl,
        public ?string $imageUrl,
    ) {
    }
}
