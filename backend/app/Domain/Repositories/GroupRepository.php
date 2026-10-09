<?php

declare(strict_types=1);

namespace App\Domain\Repositories;

use App\Domain\Models\Group;

interface GroupRepository
{
    public function findByIdForUser(int $groupId, int $userId): ?Group;
}
