<?php

declare(strict_types=1);

namespace App\Domain\Models;

use App\Domain\ValueObjects\StoragePath;
use DateTimeImmutable;

final class DiaryImage
{
    private ?int $id;

    private int $userId;

    private int $diaryId;

    private StoragePath $storagePath;

    private int $displayOrder;

    private ?DateTimeImmutable $createdAt;

    private ?DateTimeImmutable $updatedAt;

    public function __construct(
        int $userId,
        int $diaryId,
        string|StoragePath $storagePath,
        int $displayOrder = 0,
        ?int $id = null,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->diaryId = $diaryId;
        $this->storagePath = $storagePath instanceof StoragePath
            ? $storagePath
            : new StoragePath($storagePath);
        $this->displayOrder = $displayOrder;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
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

    public function getDiaryId(): int
    {
        return $this->diaryId;
    }

    public function setDiaryId(int $diaryId): void
    {
        $this->diaryId = $diaryId;
    }

    public function getStoragePath(): StoragePath
    {
        return $this->storagePath;
    }

    public function setStoragePath(string|StoragePath $storagePath): void
    {
        $this->storagePath = $storagePath instanceof StoragePath
            ? $storagePath
            : new StoragePath($storagePath);
    }

    public function getDisplayOrder(): int
    {
        return $this->displayOrder;
    }

    public function setDisplayOrder(int $displayOrder): void
    {
        $this->displayOrder = $displayOrder;
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
