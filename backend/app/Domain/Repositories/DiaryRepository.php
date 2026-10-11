<?php

declare(strict_types=1);

namespace App\Domain\Repositories;

use App\Domain\Models\Diary;
use DateTimeImmutable;

interface DiaryRepository
{
    /**
     * @return list<Diary>
     */
    public function findForUser(
        int $userId,
        ?int $personId = null,
        ?DateTimeImmutable $startDate = null,
        ?DateTimeImmutable $endDate = null,
    ): array;

    public function findByIdForUser(int $diaryId, int $userId): ?Diary;

    /**
     * @param list<int> $personIds
     */
    public function create(Diary $diary, array $personIds): Diary;

    /**
     * @param list<int>|null $personIds
     */
    public function update(Diary $diary, ?array $personIds): Diary;

    public function delete(int $diaryId, int $userId): void;

    /**
     * @return list<int>
     */
    public function findPersonIdsForDiary(int $diaryId, int $userId): array;
}
