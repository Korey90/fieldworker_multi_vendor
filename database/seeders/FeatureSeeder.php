<?php

namespace Database\Seeders;

use App\Models\Feature;
use Illuminate\Database\Seeder;

class FeatureSeeder extends Seeder
{
    public function run(): void
    {
        $features = [
            [
                'key' => 'gps_tracking',
                'name' => 'GPS Tracking',
                'description' => 'Real-time location tracking for workers'
            ],
            [
                'key' => 'photo_upload',
                'name' => 'Photo Upload',
                'description' => 'Upload photos from mobile devices'
            ],
            [
                'key' => 'digital_signatures',
                'name' => 'Digital Signatures',
                'description' => 'Capture digital signatures on forms'
            ],
            [
                'key' => 'offline_mode',
                'name' => 'Offline Mode',
                'description' => 'Work without internet connection'
            ],
            [
                'key' => 'barcode_scanning',
                'name' => 'Barcode Scanning',
                'description' => 'Scan barcodes and QR codes'
            ],
            [
                'key' => 'advanced_reporting',
                'name' => 'Advanced Reporting',
                'description' => 'Detailed analytics and custom reports'
            ],
            [
                'key' => 'api_access',
                'name' => 'API Access',
                'description' => 'Integration with third-party systems'
            ],
            [
                'key' => 'custom_forms',
                'name' => 'Custom Forms',
                'description' => 'Create unlimited custom forms'
            ],
            [
                'key' => 'notifications',
                'name' => 'Push Notifications',
                'description' => 'Real-time notifications and alerts'
            ],
            [
                'key' => 'multi_language',
                'name' => 'Multi-language Support',
                'description' => 'Support for multiple languages'
            ]
        ];

        foreach ($features as $feature) {
            Feature::create($feature);
        }
    }
}
