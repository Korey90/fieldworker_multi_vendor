<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Auth;
use App\Models\User;

echo "=== Test logowania ===" . PHP_EOL;

// Znajdź użytkownika
$user = User::where('email', 'testuser@example.com')->first();

if (!$user) {
    echo "Użytkownik nie istnieje!" . PHP_EOL;
    exit(1);
}

echo "Użytkownik znaleziony: " . $user->name . " (" . $user->email . ")" . PHP_EOL;
echo "Email verified: " . ($user->email_verified_at ? 'TAK' : 'NIE') . PHP_EOL;

// Test hasła
if (password_verify('12345678', $user->password)) {
    echo "Hasło poprawne!" . PHP_EOL;
} else {
    echo "Hasło niepoprawne!" . PHP_EOL;
}

// Test Auth::attempt
$credentials = ['email' => 'testuser@example.com', 'password' => '12345678'];

if (Auth::attempt($credentials)) {
    echo "Auth::attempt - SUKCES!" . PHP_EOL;
    echo "Zalogowany użytkownik: " . Auth::user()->name . PHP_EOL;
} else {
    echo "Auth::attempt - BŁĄD!" . PHP_EOL;
}

echo "=== Koniec testu ===" . PHP_EOL;
