<?php

declare(strict_types=1);

namespace App\Domain\Repositories;

use App\Domain\Models\Person;

interface PersonRepository
{
    /**
     * @return list<Person>
     */
    public function findForUser(int $userId, ?int $groupId = null): array;

    public function findByIdForUser(int $personId, int $userId): ?Person;

    /**
     * @param list<int> $personIds
     * @return list<Person>
     */
    public function findByIdsForUser(array $personIds, int $userId): array;

    public function create(Person $person): Person;

    public function update(Person $person): Person;
}
