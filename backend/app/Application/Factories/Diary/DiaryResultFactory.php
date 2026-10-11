<?php

declare(strict_types=1);

namespace App\Application\Factories\Diary;

use App\Application\Results\Diary\DiaryResult;
use App\Application\Results\Person\PersonResult;
use App\Domain\Exceptions\DiaryNotFound;
use App\Domain\Exceptions\InvalidDiaryPersonReference;
use App\Domain\Models\Diary;
use App\Domain\Repositories\DiaryRepository;
use App\Domain\Repositories\GroupRepository;
use App\Domain\Repositories\PersonRepository;

final class DiaryResultFactory
{
    public function __construct(
        private DiaryRepository $diaryRepository,
        private PersonRepository $personRepository,
        private GroupRepository $groupRepository,
    ) {
    }

    /**
     * @param list<int>|null $personIds
     */
    public function create(Diary $diary, int $userId, ?array $personIds = null): DiaryResult
    {
        $diaryId = $diary->getId();

        if ($diaryId === null) {
            throw new DiaryNotFound();
        }

        $ids = $personIds ?? $this->diaryRepository->findPersonIdsForDiary($diaryId, $userId);

        return new DiaryResult(
            diary: $diary,
            people: $this->resolvePeople($userId, $ids),
        );
    }

    /**
     * @param list<int> $personIds
     * @return list<PersonResult>
     */
    public function resolvePeople(int $userId, array $personIds): array
    {
        if ($personIds === []) {
            return [];
        }

        $personIds = array_values(array_unique($personIds));
        $people = $this->personRepository->findByIdsForUser($personIds, $userId);
        $peopleById = [];

        foreach ($people as $person) {
            $peopleById[$person->getId()] = $person;
        }

        foreach ($personIds as $personId) {
            if (!isset($peopleById[$personId])) {
                throw new InvalidDiaryPersonReference();
            }
        }

        return array_map(
            function (int $personId) use ($peopleById, $userId): PersonResult {
                $person = $peopleById[$personId];
                $group = $person->getGroupId() === null
                    ? null
                    : $this->groupRepository->findByIdForUser($person->getGroupId(), $userId);

                return new PersonResult($person, $group);
            },
            $personIds,
        );
    }
}
