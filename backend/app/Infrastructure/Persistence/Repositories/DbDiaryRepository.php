<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Exceptions\DiaryNotFound;
use App\Domain\Models\Diary;
use App\Domain\Models\DiaryImage;
use App\Domain\Repositories\DiaryRepository;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;

final class DbDiaryRepository implements DiaryRepository
{
    /**
     * @return list<Diary>
     */
    public function findForUser(
        int $userId,
        ?int $personId = null,
        ?DateTimeImmutable $startDate = null,
        ?DateTimeImmutable $endDate = null,
    ): array {
        $query = DB::table('diaries')
            ->where('user_id', $userId)
            ->orderByDesc('diary_date')
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($personId !== null) {
            $query->whereIn('id', DB::table('diary_people')
                ->select('diary_id')
                ->where('user_id', $userId)
                ->where('person_id', $personId));
        }

        if ($startDate !== null) {
            $query->whereDate('diary_date', '>=', $startDate->format('Y-m-d'));
        }

        if ($endDate !== null) {
            $query->whereDate('diary_date', '<=', $endDate->format('Y-m-d'));
        }

        return $query->get()
            ->map(fn (object $row): Diary => $this->toDomain($row))
            ->all();
    }

    public function findByIdForUser(int $diaryId, int $userId): ?Diary
    {
        $row = DB::table('diaries')
            ->where('id', $diaryId)
            ->where('user_id', $userId)
            ->first();

        return $row === null ? null : $this->toDomain($row);
    }

    /**
     * @param list<int> $personIds
     */
    public function create(Diary $diary, array $personIds): Diary
    {
        $diaryId = DB::transaction(function () use ($diary, $personIds): int {
            $timestamp = now();
            $diaryId = (int) DB::table('diaries')->insertGetId([
                'user_id' => $diary->getUserId(),
                'content' => $diary->getContent(),
                'diary_date' => $diary->getDiaryDate()->format('Y-m-d'),
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);

            $this->replacePeople($diaryId, $diary->getUserId(), $personIds);
            $this->insertImages($diaryId, $diary->getUserId(), $diary->getImages());

            return $diaryId;
        });

        $created = $this->findByIdForUser($diaryId, $diary->getUserId());

        if ($created === null) {
            throw new DiaryNotFound();
        }

        return $created;
    }

    /**
     * @param list<int>|null $personIds
     */
    public function update(Diary $diary, ?array $personIds): Diary
    {
        if ($diary->getId() === null) {
            throw new DiaryNotFound();
        }

        DB::transaction(function () use ($diary, $personIds): void {
            $query = DB::table('diaries')
                ->where('id', $diary->getId())
                ->where('user_id', $diary->getUserId());

            if (!$query->exists()) {
                throw new DiaryNotFound();
            }

            $query->update([
                'content' => $diary->getContent(),
                'diary_date' => $diary->getDiaryDate()->format('Y-m-d'),
                'updated_at' => now(),
            ]);

            if ($personIds !== null) {
                $this->replacePeople($diary->getId(), $diary->getUserId(), $personIds);
            }
        });

        $updated = $this->findByIdForUser($diary->getId(), $diary->getUserId());

        if ($updated === null) {
            throw new DiaryNotFound();
        }

        return $updated;
    }

    public function delete(int $diaryId, int $userId): void
    {
        $deleted = DB::transaction(function () use ($diaryId, $userId): int {
            $query = DB::table('diaries')
                ->where('id', $diaryId)
                ->where('user_id', $userId);

            if (!$query->exists()) {
                return 0;
            }

            DB::table('diary_people')
                ->where('diary_id', $diaryId)
                ->where('user_id', $userId)
                ->delete();
            DB::table('diary_images')
                ->where('diary_id', $diaryId)
                ->where('user_id', $userId)
                ->delete();

            return $query->delete();
        });

        if ($deleted === 0) {
            throw new DiaryNotFound();
        }
    }

    /**
     * @return list<int>
     */
    public function findPersonIdsForDiary(int $diaryId, int $userId): array
    {
        return DB::table('diary_people')
            ->where('diary_id', $diaryId)
            ->where('user_id', $userId)
            ->orderBy('id')
            ->pluck('person_id')
            ->map(fn (mixed $personId): int => (int) $personId)
            ->all();
    }

    private function toDomain(object $row): Diary
    {
        $images = DB::table('diary_images')
            ->where('diary_id', (int) $row->id)
            ->where('user_id', (int) $row->user_id)
            ->orderBy('display_order')
            ->orderBy('id')
            ->get()
            ->map(fn (object $image): DiaryImage => new DiaryImage(
                userId: (int) $image->user_id,
                diaryId: (int) $image->diary_id,
                storagePath: (string) $image->storage_path,
                displayOrder: (int) $image->display_order,
                id: (int) $image->id,
                createdAt: $this->toDateTime($image->created_at),
                updatedAt: $this->toDateTime($image->updated_at),
            ))
            ->all();

        return new Diary(
            userId: (int) $row->user_id,
            content: (string) $row->content,
            diaryDate: new DateTimeImmutable((string) $row->diary_date),
            id: (int) $row->id,
            createdAt: $this->toDateTime($row->created_at),
            updatedAt: $this->toDateTime($row->updated_at),
            images: $images,
        );
    }

    /**
     * @param list<int> $personIds
     */
    private function replacePeople(int $diaryId, int $userId, array $personIds): void
    {
        DB::table('diary_people')
            ->where('diary_id', $diaryId)
            ->where('user_id', $userId)
            ->delete();

        if ($personIds === []) {
            return;
        }

        DB::table('diary_people')->insert(array_map(
            fn (int $personId): array => [
                'user_id' => $userId,
                'diary_id' => $diaryId,
                'person_id' => $personId,
            ],
            array_values(array_unique($personIds)),
        ));
    }

    /**
     * @param list<DiaryImage> $images
     */
    private function insertImages(int $diaryId, int $userId, array $images): void
    {
        if ($images === []) {
            return;
        }

        $timestamp = now();
        DB::table('diary_images')->insert(array_map(
            fn (DiaryImage $image): array => [
                'user_id' => $userId,
                'diary_id' => $diaryId,
                'storage_path' => (string) $image->getStoragePath(),
                'display_order' => $image->getDisplayOrder(),
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            $images,
        ));
    }

    private function toDateTime(mixed $value): ?DateTimeImmutable
    {
        return $value === null ? null : new DateTimeImmutable((string) $value);
    }
}
