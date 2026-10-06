<?php

declare(strict_types=1);

namespace App\Domain\ValueObjects;

use InvalidArgumentException;

final class StoragePath
{
    private string $value;

    public function __construct(string $value)
    {
        if ($value === '' || strlen($value) > 2048) {
            throw new InvalidArgumentException('Storage path must be between 1 and 2048 characters.');
        }

        if (str_contains($value, "\0") || str_contains($value, '\\')) {
            throw new InvalidArgumentException('Storage path contains an invalid character.');
        }

        if (preg_match('/[\x00-\x1F\x7F]/', $value) === 1) {
            throw new InvalidArgumentException('Storage path contains a control character.');
        }

        if ($value[0] === '/' || preg_match('/\A[A-Za-z]:[\/]/', $value) === 1) {
            throw new InvalidArgumentException('Storage path must be relative.');
        }

        if (str_contains($value, ':')) {
            throw new InvalidArgumentException('Storage path must not contain a scheme.');
        }

        $segments = explode('/', $value);

        foreach ($segments as $segment) {
            if ($segment === '' || $segment === '.' || $segment === '..') {
                throw new InvalidArgumentException('Storage path contains an invalid path segment.');
            }
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
