<?php

namespace App\Actions\Ocr;

use App\DTOs\Ocr\OcrResultData;
use App\Exceptions\GoogleVisionException;
use Illuminate\Support\Facades\Http;

class AnalyzeReceiptAction
{
    private const VISION_URL = 'https://vision.googleapis.com/v1/images:annotate';

    public function execute(string $imageBase64): OcrResultData
    {
        $apiKey = config('services.google_vision.key');

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post(self::VISION_URL.'?key='.$apiKey, [
            'requests' => [[
                'image' => ['content' => $imageBase64],
                'features' => [['type' => 'TEXT_DETECTION', 'maxResults' => 1]],
            ]],
        ]);

        if ($response->failed()) {
            throw new GoogleVisionException;
        }

        $annotations = $response->json('responses.0.textAnnotations');

        if (empty($annotations)) {
            return new OcrResultData(text: '', confidence: 0.0);
        }

        $text = $annotations[0]['description'] ?? '';
        $confidence = (float) ($annotations[0]['confidence'] ?? 0.0);

        return new OcrResultData(text: $text, confidence: $confidence);
    }
}
