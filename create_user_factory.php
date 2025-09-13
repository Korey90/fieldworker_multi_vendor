<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Tenant;

echo "=== Tworzenie użytkownika przez Factory (jak w testach) ===" . PHP_EOL;

// Stwórzmy użytkownika dokładnie tak jak w testach
$user = User::factory()->create([
    'email' => 'testuser@example.com',
    'password' => bcrypt('password'), // Factory używa 'password' jako default
]);

echo "✅ Użytkownik utworzony przez Factory!" . PHP_EOL;
echo "📧 Email: " . $user->email . PHP_EOL;
echo "🔑 Hasło: password" . PHP_EOL;
echo "👤 ID: " . $user->id . PHP_EOL;
echo "🏢 Tenant ID: " . $user->tenant_id . PHP_EOL;
echo "✅ Email verified: " . ($user->email_verified_at ? 'TAK' : 'NIE') . PHP_EOL;

// Sprawdźmy czy tenant też został utworzony
$tenant = $user->tenant;
echo "🏢 Tenant: " . $tenant->name . PHP_EOL;

echo "=== Użytkownik gotowy do logowania! ===" . PHP_EOL;
