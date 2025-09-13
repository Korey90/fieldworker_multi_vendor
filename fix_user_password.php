<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Test haseł dla istniejącego użytkownika ===" . PHP_EOL;

$user = User::where('email', 'testuser@example.com')->first();

if (!$user) {
    echo "❌ Użytkownik nie istnieje!" . PHP_EOL;
    exit(1);
}

echo "📧 Email: " . $user->email . PHP_EOL;
echo "👤 Nazwa: " . $user->name . PHP_EOL;
echo "✅ Email verified: " . ($user->email_verified_at ? 'TAK' : 'NIE') . PHP_EOL;

// Test różnych haseł
$passwords = ['password', '12345678', 'secret'];

foreach ($passwords as $password) {
    $isValid = Hash::check($password, $user->password);
    echo "🔑 Hasło '$password': " . ($isValid ? '✅ POPRAWNE' : '❌ błędne') . PHP_EOL;
}

echo PHP_EOL;
echo "=== Aktualizujemy hasło na 'password' (jak w testach) ===" . PHP_EOL;

// Zaktualizuj hasło na 'password' jak w factory
$user->update([
    'password' => Hash::make('password'),
    'email_verified_at' => now(),
]);

echo "✅ Hasło zaktualizowane!" . PHP_EOL;
echo "🔑 Nowe hasło: password" . PHP_EOL;
echo "📧 Email: " . $user->email . PHP_EOL;
