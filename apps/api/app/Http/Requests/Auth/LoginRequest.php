<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'LoginRequest',
    required: ['email', 'password'],
)]
class LoginRequest extends FormRequest
{
    #[OA\Property(property: 'email', type: 'string', format: 'email', example: 'usama@example.com')]
    #[OA\Property(property: 'password', type: 'string', format: 'password', example: 'secret123')]

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
