<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'RegisterRequest',
    required: ['name', 'email', 'password', 'password_confirmation'],
)]
class RegisterRequest extends FormRequest
{
    #[OA\Property(property: 'name', type: 'string', example: 'Usama Khaki')]
    #[OA\Property(property: 'email', type: 'string', format: 'email', example: 'usama@example.com')]
    #[OA\Property(property: 'password', type: 'string', format: 'password', example: 'secret123')]
    #[OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'secret123')]
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ];
    }
}
