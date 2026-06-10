<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Service — API Routes
|--------------------------------------------------------------------------
|
| Semua route di sini akan diakses dengan prefix /auth oleh API Gateway.
| Tapi karena kita belum pakai gateway, langsung jalan di port 8001.
|
*/

// Public routes — tidak perlu token
Route::prefix('auth')->group(function () {
    Route::post('/login',   [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/logout',  [AuthController::class, 'logout']);
});

// Protected routes — butuh access token yang valid
Route::middleware('auth.jwt')->group(function () {
    // Endpoint ini dipanggil oleh service lain untuk validasi token
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Manajemen user — hanya superadmin
    Route::middleware('auth.jwt:superadmin')->prefix('users')->group(function () {
        Route::get('/',                   [UserController::class, 'index']);
        Route::post('/',                  [UserController::class, 'store']);
        Route::get('/{id}',               [UserController::class, 'show']);
        Route::put('/{id}',               [UserController::class, 'update']);
        Route::patch('/{id}/toggle-active', [UserController::class, 'toggleActive']);
    });
});
