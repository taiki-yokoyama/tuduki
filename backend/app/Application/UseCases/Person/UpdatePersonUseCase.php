<?php

declare(strict_types=1);

namespace App\Application\UseCases\Person;

use App\Application\Commands\Person\UpdatePersonCommand;
use App\Application\Results\Person\PersonResult;
use App\Domain\Exceptions\InvalidGroupReference;
use App\Domain\Exceptions\PersonNotFound;
use App\Domain\Repositories\GroupRepository;
use App\Domain\Repositories\PersonRepository;

final class UpdatePersonUseCase
{
    public function __construct(
        private PersonRepository $personRepository,
        private GroupRepository $groupRepository,
    ) {
    }

    public function execute(int $userId, int $personId, UpdatePersonCommand $command): PersonResult
    {
        $person = $this->personRepository->findByIdForUser($personId, $userId);

        if ($person === null) {
            throw new PersonNotFound();
        }

        if ($command->hasName) {
            $person->setName($command->name ?? '');
        }

        $group = null;
        if ($command->hasGroupId) {
            $group = $command->groupId === null
                ? null
                : $this->groupRepository->findByIdForUser($command->groupId, $userId);

            if ($command->groupId !== null && $group === null) {
                throw new InvalidGroupReference();
            }

            $person->setGroupId($command->groupId);
        } elseif ($person->getGroupId() !== null) {
            $group = $this->groupRepository->findByIdForUser($person->getGroupId(), $userId);
        }

        if ($command->hasNotes) {
            $person->setNotes($command->notes);
        }

        if ($command->hasAvatarColor) {
            $person->setAvatarColor($command->avatarColor ?? 'indigo');
        }

        if ($command->hasImageUrl) {
            $person->setImageUrl($command->imageUrl);
        }

        $person = $this->personRepository->update($person);

        return new PersonResult($person, $group);
    }
}
