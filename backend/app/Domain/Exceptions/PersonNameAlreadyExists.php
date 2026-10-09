<?php

declare(strict_types=1);

namespace App\Domain\Exceptions;

use RuntimeException;

final class PersonNameAlreadyExists extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('The person name is already registered for this user.');
    }
}
