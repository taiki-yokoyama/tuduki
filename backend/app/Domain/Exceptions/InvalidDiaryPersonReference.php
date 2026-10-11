<?php

declare(strict_types=1);

namespace App\Domain\Exceptions;

use RuntimeException;

final class InvalidDiaryPersonReference extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('One or more specified people do not exist.');
    }
}
