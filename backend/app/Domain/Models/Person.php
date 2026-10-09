<?php

declare(strict_types=1);

namespace App\Domain\Models;

use App\Domain\ValueObjects\PersonName;
use DateTimeImmutable;

final class Person
{
    private ?int $id;

    private int $userId;

    private PersonName $name;

    private ?int $groupId;

    private ?string $notes;

    private string $avatarColor;

    private ?string $imageUrl;

    private ?DateTimeImmutable $createdAt;

    private ?DateTimeImmutable $updatedAt;

    public function __construct(
        int $userId,
        string|PersonName $name,
        ?int $groupId = null,
        ?string $notes = null,
        string $avatarColor = 'indigo',
        ?string $imageUrl = null,
        ?int $id = null,
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->name = $name instanceof PersonName ? $name : new PersonName($name);
        $this->groupId = $groupId;
        $this->notes = $notes;
        $this->avatarColor = $avatarColor;
        $this->imageUrl = $imageUrl;
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

    public function getName(): PersonName
    {
        return $this->name;
    }

    public function setName(string|PersonName $name): void
    {
        $this->name = $name instanceof PersonName ? $name : new PersonName($name);
    }

    public function getGroupId(): ?int
    {
        return $this->groupId;
    }

    public function setGroupId(?int $groupId): void
    {
        $this->groupId = $groupId;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): void
    {
        $this->notes = $notes;
    }

    public function getAvatarColor(): string
    {
        return $this->avatarColor;
    }

    public function setAvatarColor(string $avatarColor): void
    {
        $this->avatarColor = $avatarColor;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function setImageUrl(?string $imageUrl): void
    {
        $this->imageUrl = $imageUrl;
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
