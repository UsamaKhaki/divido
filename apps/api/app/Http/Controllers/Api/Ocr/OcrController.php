<?php

namespace App\Http\Controllers\Api\Ocr;

use App\Actions\Ocr\AnalyzeReceiptAction;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Http\Requests\Ocr\AnalyzeReceiptRequest;
use App\Http\Resources\Ocr\OcrResultResource;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class OcrController extends Controller
{
    #[OA\Post(
        path: '/ocr/analyze',
        summary: 'Analyze a receipt image via Google Vision (proxied)',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/AnalyzeReceiptRequest'),
        ),
        tags: ['OCR'],
    )]
    #[OA\Response(response: 200, description: 'Extracted receipt text and confidence score')]
    #[OA\Response(response: 422, description: 'Validation error (missing or oversized image)')]
    #[OA\Response(response: 429, description: 'Rate limit exceeded')]
    #[OA\Response(response: 502, description: 'Google Vision API error')]
    public function analyze(AnalyzeReceiptRequest $request, AnalyzeReceiptAction $action): JsonResponse
    {
        $result = $action->execute($request->string('image')->value());

        return ApiResponse::ok(new OcrResultResource($result));
    }
}
