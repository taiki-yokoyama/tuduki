<?php

declare(strict_types=1);

namespace App\Application\UseCases\Image;

use App\Domain\Exceptions\DiaryImageLimitExceeded;
use App\Domain\Exceptions\DiaryNotFound;
use App\Domain\Models\DiaryImage;
use App\Domain\Repositories\DiaryImageRepository;
use App\Domain\Repositories\DiaryRepository;

final class AttachDiaryImageUseCase
{
    public function __construct(
        private DiaryRepository $diaryRepository,
        private DiaryImageRepository $diaryImageRepository,
    ) {
    }

    public function execute(
        int $userId,
        int $diaryId,
        string $storagePath,
        int $displayOrder,
    ): DiaryImage {
        if ($this->diaryRepository->findByIdForUser($diaryId, $userId) === null) {
            throw new DiaryNotFound();
        }

        $images = $this->diaryImageRepository->findForDiary($diaryId, $userId);

        if (count($images) >= 3) {
            throw new DiaryImageLimitExceeded();
        }

        return $this->diaryImageRepository->attach(new DiaryImage(
            userId: $userId,
            diaryId: $diaryId,
            storagePath: $storagePath,
            displayOrder: $displayOrder,
        ));
    }
}
