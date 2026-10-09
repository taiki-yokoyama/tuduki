<?php

declare(strict_types=1);

namespace App\Domain\Exceptions;

use RuntimeException;

final class InvalidGroupReference extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('The specified group does not exist.');
    }
}
