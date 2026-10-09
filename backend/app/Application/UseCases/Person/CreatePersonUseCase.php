<?php

declare(strict_types=1);

namespace App\Application\UseCases\Person;

use App\Application\Commands\Person\CreatePersonCommand;
use App\Application\Results\Person\PersonResult;
use App\Domain\Exceptions\GroupNotFound;
use App\Domain\Models\Person;
use App\Domain\Repositories\GroupRepository;
use App\Domain\Repositories\PersonRepository;

final class CreatePersonUseCase
{
    public function __construct(
        private PersonRepository $personRepository,
        private GroupRepository $groupRepository,
    ) {
    }

    public function execute(int $userId, CreatePersonCommand $command): PersonResult
    {
        $group = $command->groupId === null
            ? null
            : $this->groupRepository->findByIdForUser($command->groupId, $userId);

        if ($command->groupId !== null && $group === null) {
            throw new GroupNotFound();
        }

        $person = new Person(
            userId: $userId,
            name: $command->name,
            groupId: $command->groupId,
            notes: $command->notes,
            avatarColor: $command->avatarColor,
            imageUrl: $command->imageUrl,
        );
        $createdPerson = $this->personRepository->create($person);

        return new PersonResult($createdPerson, $group);
    }
}
