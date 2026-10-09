<?php

declare(strict_types=1);

namespace App\Application\Results\Person;

use App\Domain\Models\Group;
use App\Domain\Models\Person;

final readonly class PersonResult
{
    public function __construct(
        public Person $person,
        public ?Group $group,
    ) {
    }
}
