<?php

declare(strict_types=1);

namespace App\Application\UseCases\Image;

use App\Domain\Exceptions\DiaryNotFound;
use App\Domain\Repositories\DiaryImageRepository;
use App\Domain\Repositories\DiaryRepository;

final class DeleteDiaryImageUseCase
{
    public function __construct(
        private DiaryRepository $diaryRepository,
        private DiaryImageRepository $diaryImageRepository,
    ) {
    }

    public function execute(int $userId, int $diaryId, int $imageId): void
    {
        if ($this->diaryRepository->findByIdForUser($diaryId, $userId) === null) {
            throw new DiaryNotFound();
        }

        $this->diaryImageRepository->delete($imageId, $diaryId, $userId);
    }
}
