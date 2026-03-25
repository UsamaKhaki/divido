<?php

namespace App\Http\Requests\Ocr;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AnalyzeReceiptRequest',
    required: ['image'],
    properties: [
        new OA\Property(property: 'image', type: 'string', description: 'Base64-encoded JPEG image, max 10MB'),
    ],
)]
class AnalyzeReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'string', 'max:10485760'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.required' => 'An image is required.',
            'image.max' => 'The image must not exceed 10MB.',
        ];
    }
}
