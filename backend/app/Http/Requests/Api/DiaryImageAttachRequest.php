<?php

declare(strict_types=1);

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

final class DiaryImageAttachRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'storage_path' => ['required', 'string', 'max:2048'],
            'display_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
