<?php

declare(strict_types=1);

namespace App\Domain\Models;

final class DiaryPerson
{
    private ?int $id;

    private int $userId;

    private int $diaryId;

    private int $personId;

    public function __construct(
        int $userId,
        int $diaryId,
        int $personId,
        ?int $id = null,
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->diaryId = $diaryId;
        $this->personId = $personId;
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

    public function getPersonId(): int
    {
        return $this->personId;
    }

    public function setPersonId(int $personId): void
    {
        $this->personId = $personId;
    }
}
