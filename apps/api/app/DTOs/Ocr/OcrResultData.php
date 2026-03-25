<?php

namespace App\DTOs\Ocr;

class OcrResultData
{
    public function __construct(
        public readonly string $text,
        public readonly float $confidence,
    ) {}
}
