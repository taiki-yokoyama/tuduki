<?php

declare(strict_types=1);

namespace App\Domain\Exceptions;

use InvalidArgumentException;

final class InvalidPersonName extends InvalidArgumentException
{
    public function __construct()
    {
        parent::__construct(
            'Person name must be 1 to 20 characters and contain only alphanumeric characters, kanji, hiragana, katakana, or spaces.',
        );
    }
}
