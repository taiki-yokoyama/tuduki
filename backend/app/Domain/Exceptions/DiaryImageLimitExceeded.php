<?php

declare(strict_types=1);

namespace App\Domain\Exceptions;

use RuntimeException;

final class DiaryImageLimitExceeded extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('A diary can have up to 3 images.');
    }
}
