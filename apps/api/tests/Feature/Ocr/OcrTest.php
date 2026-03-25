<?php

use App\Actions\Ocr\AnalyzeReceiptAction;
use App\DTOs\Ocr\OcrResultData;
use App\Exceptions\GoogleVisionException;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('POST /api/v1/ocr/analyze', function () {

    it('returns 401 for unauthenticated requests', function () {
        $this->postJson('/api/v1/ocr/analyze', ['image' => base64_encode('fake-image-data')])
            ->assertUnauthorized();
    });

    it('returns 422 when image is missing', function () {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/ocr/analyze', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['image']);
    });

    it('returns 422 when image exceeds 10MB limit', function () {
        $user = User::factory()->create();

        // Create a string exceeding the 10MB limit
        $oversizedImage = str_repeat('A', 10_485_761);

        $this->actingAs($user)
            ->postJson('/api/v1/ocr/analyze', ['image' => $oversizedImage])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['image']);
    });

    it('returns 200 with extracted text and confidence on success', function () {
        $user = User::factory()->create();

        $this->mock(AnalyzeReceiptAction::class)
            ->shouldReceive('execute')
            ->once()
            ->andReturn(new OcrResultData(
                text: "Sheesha 600.00\nDrinks 300.00\nTotal 900.00",
                confidence: 0.91,
            ));

        $this->actingAs($user)
            ->postJson('/api/v1/ocr/analyze', ['image' => base64_encode('fake-image-data')])
            ->assertOk()
            ->assertJsonPath('data.text', "Sheesha 600.00\nDrinks 300.00\nTotal 900.00")
            ->assertJsonPath('data.confidence', 0.91);
    });

    it('returns 200 with empty text when no annotations found', function () {
        $user = User::factory()->create();

        $this->mock(AnalyzeReceiptAction::class)
            ->shouldReceive('execute')
            ->once()
            ->andReturn(new OcrResultData(text: '', confidence: 0.0));

        $this->actingAs($user)
            ->postJson('/api/v1/ocr/analyze', ['image' => base64_encode('blank-image')])
            ->assertOk()
            ->assertJsonPath('data.text', '')
            ->assertJsonPath('data.confidence', 0);
    });

    it('returns 502 when Google Vision API fails', function () {
        $user = User::factory()->create();

        $this->mock(AnalyzeReceiptAction::class)
            ->shouldReceive('execute')
            ->once()
            ->andThrow(new GoogleVisionException);

        $this->actingAs($user)
            ->postJson('/api/v1/ocr/analyze', ['image' => base64_encode('fake-image-data')])
            ->assertStatus(502)
            ->assertJsonPath('message', 'OCR service unavailable. Please try again or enter items manually.');
    });

});
