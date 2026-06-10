<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PositionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Employee Service — API Routes
| Semua route butuh JWT token kecuali /branches/active
|--------------------------------------------------------------------------
*/

// Endpoint khusus untuk Purchasing Service — tidak butuh auth
// karena dipanggil antar service (service-to-service)
Route::get('/branches/active', [BranchController::class, 'active']);

// Semua route di bawah butuh JWT token
Route::middleware('auth.jwt')->group(function () {

    // Branches
    Route::prefix('branches')->group(function () {
        Route::get('/',              [BranchController::class, 'index']);
        Route::get('/tree',          [BranchController::class, 'tree']);
        Route::get('/{id}',          [BranchController::class, 'show']);
        Route::post('/',             [BranchController::class, 'store'])->middleware('auth.jwt:superadmin,admin_hrd');
        Route::put('/{id}',          [BranchController::class, 'update'])->middleware('auth.jwt:superadmin,admin_hrd');
        Route::patch('/{id}/toggle-active', [BranchController::class, 'toggleActive'])->middleware('auth.jwt:superadmin,admin_hrd');
    });

    // Positions
    Route::prefix('positions')->group(function () {
        Route::get('/',              [PositionController::class, 'index']);
        Route::get('/tree',          [PositionController::class, 'tree']);
        Route::get('/{id}',          [PositionController::class, 'show']);
        Route::post('/',             [PositionController::class, 'store'])->middleware('auth.jwt:superadmin,admin_hrd');
        Route::put('/{id}',          [PositionController::class, 'update'])->middleware('auth.jwt:superadmin,admin_hrd');
        Route::patch('/{id}/toggle-active', [PositionController::class, 'toggleActive'])->middleware('auth.jwt:superadmin,admin_hrd');
    });

    // Employees
    Route::prefix('employees')->group(function () {
        Route::get('/',                    [EmployeeController::class, 'index']);
        Route::get('/expiring-contracts',  [EmployeeController::class, 'expiringContracts']);
        Route::get('/{id}',                [EmployeeController::class, 'show']);
        Route::post('/',                   [EmployeeController::class, 'store'])->middleware('auth.jwt:superadmin,admin_hrd');
        Route::put('/{id}',                [EmployeeController::class, 'update'])->middleware('auth.jwt:superadmin,admin_hrd');
        Route::patch('/{id}/toggle-active', [EmployeeController::class, 'toggleActive'])->middleware('auth.jwt:superadmin,admin_hrd');
    });
});
