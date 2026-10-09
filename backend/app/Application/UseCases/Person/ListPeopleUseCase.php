<?php

declare(strict_types=1);

namespace App\Application\UseCases\Person;

use App\Application\Queries\Person\ListPeopleQuery;
use App\Application\Results\Person\PersonResult;
use App\Domain\Repositories\GroupRepository;
use App\Domain\Repositories\PersonRepository;

final class ListPeopleUseCase
{
    public function __construct(
        private PersonRepository $personRepository,
        private GroupRepository $groupRepository,
    ) {
    }

    /**
     * @return list<PersonResult>
     */
    public function execute(ListPeopleQuery $query): array
    {
        return array_map(
            fn ($person): PersonResult => new PersonResult(
                $person,
                $person->getGroupId() === null
                    ? null
                    : $this->groupRepository->findByIdForUser($person->getGroupId(), $query->userId),
            ),
            $this->personRepository->findForUser($query->userId, $query->groupId),
        );
    }
}
