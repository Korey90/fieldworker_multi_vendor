<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Attachment;
use App\Models\Job;
use App\Models\FormResponse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AttachmentSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();

        foreach ($tenants as $tenant) {
            // Create attachments for jobs
            $jobs = Job::where('tenant_id', $tenant->id)->get();
            foreach ($jobs->take(rand(5, 10)) as $job) {
                $attachmentCount = rand(1, 4);
                
                for ($i = 1; $i <= $attachmentCount; $i++) {
                    $filename = 'document_' . Str::random(8) . '.pdf';
                    Attachment::create([
                        'id' => Str::uuid(),
                        'tenant_id' => $tenant->id,
                        'user_id' => User::where('tenant_id', $tenant->id)->inRandomOrder()->first()?->id,
                        'attachable_type' => 'job',
                        'attachable_id' => $job->id,
                        'filename' => $filename,
                        'original_filename' => $filename,
                        'file_path' => $this->generateFilePath('job'),
                        'file_type' => $this->getRandomFileType(),
                        'mime_type' => 'application/pdf',
                        'file_size' => rand(100, 5000) * 1024 // Size in bytes
                    ]);
                }
            }

            // Create attachments for form responses
            $formResponses = FormResponse::whereHas('form', function ($query) use ($tenant) {
                $query->where('tenant_id', $tenant->id);
            })->get();

            foreach ($formResponses->take(rand(3, 8)) as $formResponse) {
                if (rand(0, 1) == 1) { // 50% chance of having attachments
                    $attachmentCount = rand(1, 3);
                    
                    for ($i = 1; $i <= $attachmentCount; $i++) {
                        $filename = 'response_' . Str::random(8) . '.jpg';
                        Attachment::create([
                            'id' => Str::uuid(),
                            'tenant_id' => $tenant->id,
                            'user_id' => User::where('tenant_id', $tenant->id)->inRandomOrder()->first()?->id,
                            'attachable_type' => 'form_response',
                            'attachable_id' => $formResponse->id,
                            'filename' => $filename,
                            'original_filename' => $filename,
                            'file_path' => $this->generateFilePath('form_response'),
                            'file_type' => $this->getRandomFileType(),
                            'mime_type' => 'image/jpeg',
                            'file_size' => rand(50, 2000) * 1024
                        ]);
                    }
                }
            }
        }
    }

    private function generateFilePath($entityType): string
    {
        $year = date('Y');
        $month = date('m');
        $fileName = Str::uuid() . $this->getRandomFileExtension();
        
        return "attachments/{$entityType}/{$year}/{$month}/{$fileName}";
    }

    private function getRandomFileType(): string
    {
        $types = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'video/mp4', 'audio/mpeg'
        ];

        return $types[rand(0, count($types) - 1)];
    }

    private function getRandomFileExtension(): string
    {
        $extensions = ['.jpg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.mp4', '.mp3'];
        return $extensions[rand(0, count($extensions) - 1)];
    }
}
