<?php

declare(strict_types=1);

namespace App\Domain\Exceptions;

use RuntimeException;

final class GroupNameAlreadyExists extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('The group name is already in use.');
    }
}
