<?php

declare(strict_types=1);

namespace App\Domain\Repositories;

use App\Domain\Models\Group;

interface GroupRepository
{
    /**
     * @return list<Group>
     */
    public function findForUser(int $userId): array;

    public function findByIdForUser(int $groupId, int $userId): ?Group;

    public function create(Group $group): Group;

    public function delete(int $groupId, int $userId): void;
}
