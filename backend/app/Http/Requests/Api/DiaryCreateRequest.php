<?php

declare(strict_types=1);

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

final class DiaryCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'min:1'],
            'diary_date' => ['required', 'date_format:Y-m-d'],
            'person_ids' => ['sometimes', 'array', 'distinct'],
            'person_ids.*' => ['integer', 'min:1'],
            'images' => ['sometimes', 'array', 'max:3'],
            'images.*.storage_path' => ['required', 'string', 'max:2048'],
            'images.*.display_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
