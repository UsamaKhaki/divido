<?php

namespace App\Actions\Auth;

use App\DTOs\Auth\RegisterData;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RegisterUserAction
{
    public function execute(RegisterData $data): array
    {
        $user = User::create([
            'name'     => $data->name,
            'email'    => $data->email,
            'password' => Hash::make($data->password),
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return compact('user', 'token');
    }
}
