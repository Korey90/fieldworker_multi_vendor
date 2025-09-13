<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/test-auth', function () {
    return [
        'authenticated' => auth()->check(),
        'user' => auth()->user(),
        'session_id' => session()->getId(),
    ];
});

Route::post('/test-csrf', function () {
    return [
        'message' => 'CSRF token prawidłowy!',
        'timestamp' => now(),
    ];
});

Route::get('/debug-session', function () {
    return [
        'authenticated' => auth()->check(),
        'user' => auth()->user(),
        'session_id' => session()->getId(),
        'session_data' => session()->all(),
    ];
});



require __DIR__.'/tenant.php';// tenant routes
require __DIR__.'/admin.php';// admin routes
require __DIR__.'/settings.php';// settings routes
require __DIR__.'/auth.php';// auth routes
