<?php

namespace App\Actions\Ocr;

use App\DTOs\Ocr\OcrResultData;
use App\Exceptions\GoogleVisionException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class AnalyzeReceiptAction
{
    private const VISION_URL = 'https://vision.googleapis.com/v1/images:annotate';

    private const TIMEOUT_SECONDS = 15;

    public function execute(string $imageBase64): OcrResultData
    {
        try {
            // Send the key as a header rather than a query parameter so it does
            // not end up in request URLs that proxies and error trackers log.
            $response = Http::withHeaders(['X-Goog-Api-Key' => (string) config('services.google_vision.key')])
                ->acceptJson()
                ->timeout(self::TIMEOUT_SECONDS)
                ->post(self::VISION_URL, [
                    'requests' => [[
                        'image' => ['content' => $imageBase64],
                        'features' => [['type' => 'TEXT_DETECTION', 'maxResults' => 1]],
                    ]],
                ]);
        } catch (ConnectionException $e) {
            throw new GoogleVisionException(previous: $e);
        }

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
