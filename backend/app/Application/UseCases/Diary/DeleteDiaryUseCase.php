<?php

declare(strict_types=1);

namespace App\Application\UseCases\Diary;

use App\Domain\Repositories\DiaryRepository;

final class DeleteDiaryUseCase
{
    public function __construct(
        private DiaryRepository $diaryRepository,
    ) {
    }

    public function execute(int $userId, int $diaryId): void
    {
        $this->diaryRepository->delete($diaryId, $userId);
    }
}
