<?php

declare(strict_types=1);

namespace App\Domain\Repositories;

use App\Domain\Models\DiaryImage;

interface DiaryImageRepository
{
    /**
     * @return list<DiaryImage>
     */
    public function findForDiary(int $diaryId, int $userId): array;

    public function attach(DiaryImage $image): DiaryImage;

    public function delete(int $imageId, int $diaryId, int $userId): void;
}
