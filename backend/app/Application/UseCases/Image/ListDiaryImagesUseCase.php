<?php

declare(strict_types=1);

namespace App\Application\UseCases\Image;

use App\Domain\Exceptions\DiaryNotFound;
use App\Domain\Models\DiaryImage;
use App\Domain\Repositories\DiaryImageRepository;
use App\Domain\Repositories\DiaryRepository;

final class ListDiaryImagesUseCase
{
    public function __construct(
        private DiaryRepository $diaryRepository,
        private DiaryImageRepository $diaryImageRepository,
    ) {
    }

    /**
     * @return list<DiaryImage>
     */
    public function execute(int $userId, int $diaryId): array
    {
        if ($this->diaryRepository->findByIdForUser($diaryId, $userId) === null) {
            throw new DiaryNotFound();
        }

        return $this->diaryImageRepository->findForDiary($diaryId, $userId);
    }
}
