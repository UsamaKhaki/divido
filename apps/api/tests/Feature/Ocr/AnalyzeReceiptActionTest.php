<?php

use App\Actions\Ocr\AnalyzeReceiptAction;
use App\Exceptions\GoogleVisionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    config(['services.google_vision.key' => 'test-vision-key']);
});

it('sends the API key as a header and returns the detected text', function () {
    Http::fake([
        'vision.googleapis.com/*' => Http::response([
            'responses' => [['textAnnotations' => [['description' => "Karak Tea 3.00\nSamosa 4.50"]]]],
        ]),
    ]);

    $result = app(AnalyzeReceiptAction::class)->execute(base64_encode('receipt'));

    expect($result->text)->toBe("Karak Tea 3.00\nSamosa 4.50");

    Http::assertSent(fn (Request $request) => $request->hasHeader('X-Goog-Api-Key', 'test-vision-key')
        && ! str_contains($request->url(), 'key='));
});

it('returns empty text when Vision finds nothing', function () {
    Http::fake(['vision.googleapis.com/*' => Http::response(['responses' => [[]]])]);

    $result = app(AnalyzeReceiptAction::class)->execute(base64_encode('blank'));

    expect($result->text)->toBe('')
        ->and($result->confidence)->toBe(0.0);
});

it('throws GoogleVisionException when Vision returns an error', function () {
    Http::fake(['vision.googleapis.com/*' => Http::response(['error' => ['code' => 403]], 403)]);

    app(AnalyzeReceiptAction::class)->execute(base64_encode('receipt'));
})->throws(GoogleVisionException::class);

it('throws GoogleVisionException when Vision cannot be reached', function () {
    Http::fake(['vision.googleapis.com/*' => Http::failedConnection()]);

    app(AnalyzeReceiptAction::class)->execute(base64_encode('receipt'));
})->throws(GoogleVisionException::class);
