<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Exceptions\DiaryImageNotFound;
use App\Domain\Models\DiaryImage;
use App\Domain\Repositories\DiaryImageRepository;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;

final class DbDiaryImageRepository implements DiaryImageRepository
{
    /**
     * @return list<DiaryImage>
     */
    public function findForDiary(int $diaryId, int $userId): array
    {
        return DB::table('diary_images')
            ->where('diary_id', $diaryId)
            ->where('user_id', $userId)
            ->orderBy('display_order')
            ->orderBy('id')
            ->get()
            ->map(fn (object $row): DiaryImage => $this->toDomain($row))
            ->all();
    }

    public function attach(DiaryImage $image): DiaryImage
    {
        $timestamp = now();
        $id = DB::table('diary_images')->insertGetId([
            'user_id' => $image->getUserId(),
            'diary_id' => $image->getDiaryId(),
            'storage_path' => (string) $image->getStoragePath(),
            'display_order' => $image->getDisplayOrder(),
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $row = DB::table('diary_images')
            ->where('id', $id)
            ->where('diary_id', $image->getDiaryId())
            ->where('user_id', $image->getUserId())
            ->first();

        if ($row === null) {
            throw new DiaryImageNotFound();
        }

        return $this->toDomain($row);
    }

    public function delete(int $imageId, int $diaryId, int $userId): void
    {
        $deleted = DB::table('diary_images')
            ->where('id', $imageId)
            ->where('diary_id', $diaryId)
            ->where('user_id', $userId)
            ->delete();

        if ($deleted === 0) {
            throw new DiaryImageNotFound();
        }
    }

    private function toDomain(object $row): DiaryImage
    {
        return new DiaryImage(
            userId: (int) $row->user_id,
            diaryId: (int) $row->diary_id,
            storagePath: (string) $row->storage_path,
            displayOrder: (int) $row->display_order,
            id: (int) $row->id,
            createdAt: $this->toDateTime($row->created_at),
            updatedAt: $this->toDateTime($row->updated_at),
        );
    }

    private function toDateTime(mixed $value): ?DateTimeImmutable
    {
        return $value === null ? null : new DateTimeImmutable((string) $value);
    }
}
