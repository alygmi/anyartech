<?php

use App\Http\Controllers\ItemController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Purchase Service — API Routes
| Semua route membutuhkan JWT (validasi via Auth Service)
|--------------------------------------------------------------------------
*/

Route::middleware('auth.jwt')->group(function () {
    // Vendors
    Route::get('vendors/{vendor}/purchase-history', [VendorController::class, 'purchaseHistory']);
    Route::apiResource('vendors', VendorController::class);

    // Items
    Route::apiResource('items', ItemController::class);

    // Purchase Orders
    Route::apiResource('purchase-orders', PurchaseOrderController::class)->only(['index', 'show', 'store']);
    Route::get('branches', [PurchaseOrderController::class, 'branches']);
    Route::put('purchase-orders/{purchase_order}/items', [PurchaseOrderController::class, 'updateItems']);
    Route::patch('purchase-orders/{purchase_order}/submit', [PurchaseOrderController::class, 'submit']);
    Route::patch('purchase-orders/{purchase_order}/approve', [PurchaseOrderController::class, 'approve']);
    Route::patch('purchase-orders/{purchase_order}/reject', [PurchaseOrderController::class, 'reject']);
    Route::patch('purchase-orders/{purchase_order}/receive', [PurchaseOrderController::class, 'receive']);
    Route::patch('purchase-orders/{purchase_order}/cancel', [PurchaseOrderController::class, 'cancel']);
});
