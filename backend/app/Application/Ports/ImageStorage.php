<?php

declare(strict_types=1);

namespace App\Application\Ports;

use Illuminate\Http\UploadedFile;

interface ImageStorage
{
    public function store(UploadedFile $file): string;

    public function url(string $storagePath): string;
}
