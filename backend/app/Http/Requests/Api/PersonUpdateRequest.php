<?php

declare(strict_types=1);

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

final class PersonUpdateRequest extends FormRequest
{
    private const FIELDS = ['name', 'group_id', 'notes', 'avatar_color', 'image_url'];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'min:1', 'max:20'],
            'group_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'avatar_color' => ['sometimes', 'string', 'max:50'],
            'image_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
        ];
    }

    protected function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach (self::FIELDS as $field) {
                if (array_key_exists($field, $this->all())) {
                    return;
                }
            }

            $validator->errors()->add('person', 'At least one field must be provided.');
        });
    }
}
