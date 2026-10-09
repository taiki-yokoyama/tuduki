<?php

declare(strict_types=1);

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

final class PersonCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1', 'max:20'],
            'group_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'avatar_color' => ['sometimes', 'string', 'max:50'],
            'image_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
        ];
    }
}
