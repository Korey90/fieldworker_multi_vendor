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
                'feature_key' => 'gps_tracking',
                'name' => 'GPS Tracking',
                'description' => 'Real-time location tracking for workers',
                'feature_type' => 'core',
                'is_active' => true,
            ],
            [
                'feature_key' => 'photo_upload',
                'name' => 'Photo Upload',
                'description' => 'Upload photos from mobile devices',
                'feature_type' => 'core',
                'is_active' => true,
            ],
            [
                'feature_key' => 'digital_signatures',
                'name' => 'Digital Signatures',
                'description' => 'Capture digital signatures on forms',
                'feature_type' => 'core',
                'is_active' => true,
            ],
            [
                'feature_key' => 'offline_mode',
                'name' => 'Offline Mode',
                'description' => 'Work without internet connection',
                'feature_type' => 'premium',
                'is_active' => true,
            ],
            [
                'feature_key' => 'barcode_scanning',
                'name' => 'Barcode Scanning',
                'description' => 'Scan barcodes and QR codes',
                'feature_type' => 'premium',
                'is_active' => true,
            ],
            [
                'feature_key' => 'advanced_reporting',
                'name' => 'Advanced Reporting',
                'description' => 'Detailed analytics and custom reports',
                'feature_type' => 'premium',
                'is_active' => true,
            ],
            [
                'feature_key' => 'api_access',
                'name' => 'API Access',
                'description' => 'Integration with third-party systems',
                'feature_type' => 'addon',
                'is_active' => true,
                'config' => [
                    'rate_limit' => 1000,
                    'allowed_endpoints' => ['all']
                ],
            ],
            [
                'feature_key' => 'custom_forms',
                'name' => 'Custom Forms',
                'description' => 'Create unlimited custom forms',
                'feature_type' => 'premium',
                'is_active' => true,
                'config' => [
                    'max_forms' => 50,
                    'max_fields_per_form' => 100
                ],
            ],
            [
                'feature_key' => 'notifications',
                'name' => 'Push Notifications',
                'description' => 'Real-time notifications and alerts',
                'feature_type' => 'core',
                'is_active' => true,
            ],
            [
                'feature_key' => 'multi_language',
                'name' => 'Multi-language Support',
                'description' => 'Support for multiple languages',
                'feature_type' => 'addon',
                'is_active' => false,
                'config' => [
                    'supported_languages' => ['en', 'es', 'fr', 'de']
                ],
            ]
        ];

        foreach ($features as $feature) {
            Feature::create($feature);
        }
    }
}
