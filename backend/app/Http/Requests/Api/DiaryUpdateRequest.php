<?php

declare(strict_types=1);

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class DiaryUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['sometimes', 'string', 'min:1'],
            'diary_date' => ['sometimes', 'date_format:Y-m-d'],
            'person_ids' => ['sometimes', 'array', 'distinct'],
            'person_ids.*' => ['integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->all() === []) {
                $validator->errors()->add('diary', 'At least one field is required.');
            }
        });
    }
}
