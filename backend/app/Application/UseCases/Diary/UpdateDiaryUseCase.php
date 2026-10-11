<?php

declare(strict_types=1);

namespace App\Application\UseCases\Diary;

use App\Application\Commands\Diary\UpdateDiaryCommand;
use App\Application\Factories\Diary\DiaryResultFactory;
use App\Application\Results\Diary\DiaryResult;
use App\Domain\Exceptions\DiaryNotFound;
use App\Domain\Repositories\DiaryRepository;

final class UpdateDiaryUseCase
{
    public function __construct(
        private DiaryRepository $diaryRepository,
        private DiaryResultFactory $diaryResultFactory,
    ) {
    }

    public function execute(int $userId, int $diaryId, UpdateDiaryCommand $command): DiaryResult
    {
        $diary = $this->diaryRepository->findByIdForUser($diaryId, $userId);

        if ($diary === null) {
            throw new DiaryNotFound();
        }

        if ($command->hasContent) {
            $diary->setContent($command->content ?? '');
        }

        if ($command->hasDiaryDate) {
            $diary->setDiaryDate($command->diaryDate);
        }

        if ($command->hasPersonIds) {
            $this->diaryResultFactory->resolvePeople($userId, $command->personIds ?? []);
        }

        $updatedDiary = $this->diaryRepository->update(
            $diary,
            $command->hasPersonIds ? $command->personIds : null,
        );

        return $this->diaryResultFactory->create(
            $updatedDiary,
            $userId,
            $command->hasPersonIds ? $command->personIds : null,
        );
    }
}
