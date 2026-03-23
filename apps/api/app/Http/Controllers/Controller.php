<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: 'Divido API',
    version: '1.0.0',
    description: 'Smart group expense splitting API',
)]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
)]
#[OA\Server(url: '/api/v1', description: 'API v1')]
abstract class Controller
{
    //
}
