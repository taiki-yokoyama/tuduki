<?php

declare(strict_types=1);

namespace App\Infrastructure\Storage;

use App\Application\Ports\ImageStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

final class PublicImageStorage implements ImageStorage
{
    public function store(UploadedFile $file): string
    {
        $storagePath = $file->store('diaries', 'public');

        if (!is_string($storagePath) || $storagePath === '') {
            throw new RuntimeException('Image storage failed.');
        }

        return $storagePath;
    }

    public function url(string $storagePath): string
    {
        return url(Storage::disk('public')->url($storagePath));
    }
}
