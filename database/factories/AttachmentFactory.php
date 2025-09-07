<?php

namespace Database\Factories;

use App\Models\Attachment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attachment>
 */
class AttachmentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Attachment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $filename = $this->faker->unique()->uuid() . '.pdf';
        $originalFilename = $this->faker->words(3, true) . '.pdf';
        
        return [
            'tenant_id' => Tenant::factory(),
            'user_id' => User::factory(),
            'filename' => $filename,
            'original_filename' => $originalFilename,
            'file_path' => 'attachments/test/' . $filename,
            'file_type' => 'document',
            'file_size' => $this->faker->numberBetween(1024, 5242880), // 1KB to 5MB
            'mime_type' => 'application/pdf',
            'attachable_type' => null,
            'attachable_id' => null,
            'data' => [
                'description' => $this->faker->sentence(),
                'uploaded_at' => now(),
                'ip_address' => $this->faker->ipv4(),
            ],
        ];
    }

    /**
     * Indicate that the attachment is for a job.
     */
    public function forJob(): static
    {
        return $this->state(fn (array $attributes) => [
            'attachable_type' => 'App\\Models\\Job',
            'attachable_id' => 1,
        ]);
    }

    /**
     * Indicate that the attachment is for a worker.
     */
    public function forWorker(): static
    {
        return $this->state(fn (array $attributes) => [
            'attachable_type' => 'App\\Models\\Worker',
            'attachable_id' => 1,
        ]);
    }

    /**
     * Indicate that the attachment is an image.
     */
    public function image(): static
    {
        $filename = $this->faker->unique()->uuid() . '.jpg';
        
        return $this->state(fn (array $attributes) => [
            'filename' => $filename,
            'original_filename' => $this->faker->words(3, true) . '.jpg',
            'file_path' => 'attachments/test/' . $filename,
            'file_type' => 'image',
            'mime_type' => 'image/jpeg',
        ]);
    }

    /**
     * Indicate that the attachment is a document.
     */
    public function document(): static
    {
        $filename = $this->faker->unique()->uuid() . '.pdf';
        
        return $this->state(fn (array $attributes) => [
            'filename' => $filename,
            'original_filename' => $this->faker->words(3, true) . '.pdf',
            'file_path' => 'attachments/test/' . $filename,
            'file_type' => 'document',
            'mime_type' => 'application/pdf',
        ]);
    }
}
