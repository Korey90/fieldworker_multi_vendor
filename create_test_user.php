<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Tenant;
use App\Models\User;

// Pobierz pierwszego tenanta
$tenant = Tenant::first();

if (!$tenant) {
    echo "Brak tenantów w bazie danych!" . PHP_EOL;
    exit(1);
}

echo "Używam tenanta: " . $tenant->name . " (ID: " . $tenant->id . ")" . PHP_EOL;

// Utwórz użytkownika
$user = User::create([
    'name' => 'Test User 2',
    'email' => 'testuser@example.com',
    'password' => bcrypt('12345678'),
    'tenant_id' => $tenant->id,
    'email_verified_at' => now()
]);

echo "Użytkownik utworzony!" . PHP_EOL;
echo "ID: " . $user->id . PHP_EOL;
echo "Email: " . $user->email . PHP_EOL;
echo "Hasło: 12345678" . PHP_EOL;
