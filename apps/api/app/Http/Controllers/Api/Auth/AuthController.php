<?php

namespace App\Http\Controllers\Api\Auth;

use App\Actions\Auth\RegisterUserAction;
use App\DTOs\Auth\RegisterData;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\Auth\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
        path: '/auth/register',
        summary: 'Register a new user account',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/RegisterRequest'),
        ),
        tags: ['Auth'],
    )]
    #[OA\Response(response: 201, description: 'Account created successfully')]
    #[OA\Response(response: 422, description: 'Validation error')]
    public function register(RegisterRequest $request, RegisterUserAction $action): JsonResponse
    {
        $result = $action->execute(RegisterData::fromRequest($request));

        return ApiResponse::created([
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
        ], 'Account created successfully.');
    }

    #[OA\Post(
        path: '/auth/login',
        summary: 'Login and receive a Sanctum token',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/LoginRequest'),
        ),
        tags: ['Auth'],
    )]
    #[OA\Response(response: 200, description: 'Logged in successfully')]
    #[OA\Response(response: 401, description: 'Invalid credentials')]
    #[OA\Response(response: 422, description: 'Validation error')]
    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('api')->plainTextToken;

        return ApiResponse::ok([
            'token' => $token,
            'user' => new UserResource($user),
        ], 'Logged in successfully.');
    }

    #[OA\Post(
        path: '/auth/logout',
        summary: 'Revoke the current token',
        security: [['sanctum' => []]],
        tags: ['Auth'],
    )]
    #[OA\Response(response: 200, description: 'Logged out successfully')]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        if (method_exists($token, 'delete')) {
            $token->delete();
        } else {
            $request->user()->tokens()->delete();
        }

        return ApiResponse::noContent('Logged out successfully.');
    }

    #[OA\Get(
        path: '/auth/me',
        summary: 'Return the authenticated user',
        security: [['sanctum' => []]],
        tags: ['Auth'],
    )]
    #[OA\Response(response: 200, description: 'Authenticated user')]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    public function me(Request $request): JsonResponse
    {
        return ApiResponse::ok(new UserResource($request->user()));
    }
}
