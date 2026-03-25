<?php

namespace App\Http\Resources\Ocr;

use App\DTOs\Ocr\OcrResultData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin OcrResultData
 */
class OcrResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'text' => $this->text,
            'confidence' => $this->confidence,
        ];
    }
}
