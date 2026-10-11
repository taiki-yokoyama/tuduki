<?php

declare(strict_types=1);

namespace App\Http\Mappers;

use App\Application\Results\Image\UploadedImageResult;
use App\Domain\Models\DiaryImage;

final class ImageMapper
{
    /**
     * @return array{storage_path: string, url: string}
     */
    public function uploadedToArray(UploadedImageResult $result): array
    {
        return [
            'storage_path' => $result->storagePath,
            'url' => $result->url,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function diaryImageToArray(DiaryImage $image): array
    {
        $storagePath = (string) $image->getStoragePath();

        return [
            'id' => $image->getId(),
            'diary_id' => $image->getDiaryId(),
            'storage_path' => $storagePath,
            'display_order' => $image->getDisplayOrder(),
            'url' => url(\Illuminate\Support\Facades\Storage::disk('public')->url($storagePath)),
        ];
    }
}
