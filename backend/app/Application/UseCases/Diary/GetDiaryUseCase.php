<?php

declare(strict_types=1);

namespace App\Application\UseCases\Diary;

use App\Application\Factories\Diary\DiaryResultFactory;
use App\Application\Results\Diary\DiaryResult;
use App\Domain\Exceptions\DiaryNotFound;
use App\Domain\Repositories\DiaryRepository;

final class GetDiaryUseCase
{
    public function __construct(
        private DiaryRepository $diaryRepository,
        private DiaryResultFactory $diaryResultFactory,
    ) {
    }

    public function execute(int $userId, int $diaryId): DiaryResult
    {
        $diary = $this->diaryRepository->findByIdForUser($diaryId, $userId);

        if ($diary === null) {
            throw new DiaryNotFound();
        }

        return $this->diaryResultFactory->create($diary, $userId);
    }
}
