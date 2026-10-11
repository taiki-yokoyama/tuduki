<?php

declare(strict_types=1);

namespace App\Application\UseCases\Diary;

use App\Application\Commands\Diary\CreateDiaryCommand;
use App\Application\Factories\Diary\DiaryResultFactory;
use App\Application\Results\Diary\DiaryResult;
use App\Domain\Models\Diary;
use App\Domain\Models\DiaryImage;
use App\Domain\Repositories\DiaryRepository;

final class CreateDiaryUseCase
{
    public function __construct(
        private DiaryRepository $diaryRepository,
        private DiaryResultFactory $diaryResultFactory,
    ) {
    }

    public function execute(int $userId, CreateDiaryCommand $command): DiaryResult
    {
        $this->diaryResultFactory->resolvePeople($userId, $command->personIds);
        $images = array_map(
            fn ($image): DiaryImage => new DiaryImage(
                userId: $userId,
                diaryId: 0,
                storagePath: $image->storagePath,
                displayOrder: $image->displayOrder,
            ),
            $command->images,
        );
        $diary = new Diary(
            userId: $userId,
            content: $command->content,
            diaryDate: $command->diaryDate,
            images: $images,
        );
        $createdDiary = $this->diaryRepository->create($diary, $command->personIds);

        return $this->diaryResultFactory->create($createdDiary, $userId, $command->personIds);
    }
}
