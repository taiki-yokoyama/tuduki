<?php

declare(strict_types=1);

namespace App\Application\UseCases\Diary;

use App\Application\Factories\Diary\DiaryResultFactory;
use App\Application\Queries\Diary\ListDiariesQuery;
use App\Application\Results\Diary\DiaryResult;
use App\Domain\Repositories\DiaryRepository;

final class ListDiariesUseCase
{
    public function __construct(
        private DiaryRepository $diaryRepository,
        private DiaryResultFactory $diaryResultFactory,
    ) {
    }

    /**
     * @return list<DiaryResult>
     */
    public function execute(ListDiariesQuery $query): array
    {
        return array_map(
            fn ($diary): DiaryResult => $this->diaryResultFactory->create($diary, $query->userId),
            $this->diaryRepository->findForUser(
                $query->userId,
                $query->personId,
                $query->startDate,
                $query->endDate,
            ),
        );
    }
}
