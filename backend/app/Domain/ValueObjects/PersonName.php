<?php

declare(strict_types=1);

namespace App\Domain\ValueObjects;

use InvalidArgumentException;

final class PersonName
{
    private string $value;

    public function __construct(string $value)
    {
        if (preg_match('/\A[0-9A-Za-z\p{Han}\p{Hiragana}\p{Katakana}]+\z/u', $value) !== 1) {
            throw new InvalidArgumentException(
                'Person name must contain only alphanumeric characters, kanji, hiragana, or katakana.',
            );
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
