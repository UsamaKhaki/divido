<?php

namespace App\Http\Requests\Groups;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'StoreGroupRequest',
    required: ['name'],
)]
class StoreGroupRequest extends FormRequest
{
    #[OA\Property(property: 'name', type: 'string', example: 'Weekend Trip')]

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
