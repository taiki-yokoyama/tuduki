<?php

declare(strict_types=1);

namespace App\Domain\Models;

use DateTimeImmutable;
use InvalidArgumentException;

final class Diary
{
    public const MAX_IMAGES = 3;

    private ?int $id;

    private int $userId;

    private string $content;

    private DateTimeImmutable $diaryDate;

    /**
     * @var list<DiaryImage>
     */
    private array $images;

    private ?DateTimeImmutable $createdAt;

    private ?DateTimeImmutable $updatedAt;

    public function __construct(
        int $userId,
        string $content,
        DateTimeImmutable $diaryDate,
        ?int $id = null,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        array $images = [],
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->content = $content;
        $this->diaryDate = $diaryDate;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->setImages($images);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function setContent(string $content): void
    {
        $this->content = $content;
    }

    public function getDiaryDate(): DateTimeImmutable
    {
        return $this->diaryDate;
    }

    public function setDiaryDate(DateTimeImmutable $diaryDate): void
    {
        $this->diaryDate = $diaryDate;
    }

    /**
     * @return list<DiaryImage>
     */
    public function getImages(): array
    {
        return $this->images;
    }

    /**
     * @param list<DiaryImage> $images
     */
    public function setImages(array $images): void
    {
        if (count($images) > self::MAX_IMAGES) {
            throw new InvalidArgumentException('A diary can have up to 3 images.');
        }

        foreach ($images as $image) {
            if (!$image instanceof DiaryImage) {
                throw new InvalidArgumentException('Diary images must be instances of DiaryImage.');
            }
        }

        $this->images = array_values($images);
    }

    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?DateTimeImmutable $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): ?DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?DateTimeImmutable $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }
}
