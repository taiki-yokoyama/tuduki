<?php

declare(strict_types=1);

namespace App\Domain\ValueObjects;

use App\Domain\Exceptions\InvalidPersonName;

final class PersonName
{
    public const MAX_LENGTH = 20;

    private string $value;

    public function __construct(string $value)
    {
        if (
            mb_strlen($value) > self::MAX_LENGTH
            || preg_match(
                '/\A[0-9A-Za-z\p{Han}\p{Hiragana}\p{Katakana}]+(?:[ \x{3000}][0-9A-Za-z\p{Han}\p{Hiragana}\p{Katakana}]+)*\z/u',
                $value,
            ) !== 1
        ) {
            throw new InvalidPersonName();
        }

        $this->value = $value;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
