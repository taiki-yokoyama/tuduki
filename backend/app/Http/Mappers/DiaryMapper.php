<?php

declare(strict_types=1);

namespace App\Http\Mappers;

use App\Application\Results\Diary\DiaryResult;

final class DiaryMapper
{
    public function __construct(
        private PersonMapper $personMapper,
        private ImageMapper $imageMapper,
    ) {
    }

    /**
     * @param list<DiaryResult> $results
     * @return list<array<string, mixed>>
     */
    public function toList(array $results): array
    {
        return array_map(
            fn (DiaryResult $result): array => $this->toArray($result),
            $results,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(DiaryResult $result): array
    {
        return [
            'id' => $result->diary->getId(),
            'content' => $result->diary->getContent(),
            'diary_date' => $result->diary->getDiaryDate()->format('Y-m-d'),
            'created_at' => $result->diary->getCreatedAt()?->format(DATE_ATOM),
            'updated_at' => $result->diary->getUpdatedAt()?->format(DATE_ATOM),
            'people' => array_map(
                fn ($person): array => $this->personMapper->toArray($person),
                $result->people,
            ),
            'images' => array_map(
                fn ($image): array => $this->imageMapper->diaryImageToArray($image),
                $result->diary->getImages(),
            ),
        ];
    }
}
