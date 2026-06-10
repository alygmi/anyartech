<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('po_number', 50)->unique();
            $table->unsignedBigInteger('branch_id');
            $table->string('branch_name', 100);
            $table->string('branch_code', 20);
            $table->unsignedBigInteger('vendor_id');
            $table->unsignedBigInteger('requested_by');
            $table->enum('status', [
                'draft', 'submitted', 'approved', 'rejected', 'received', 'cancelled'
            ])->default('draft');
            $table->date('tanggal_po');
            $table->date('tanggal_dibutuhkan')->nullable();
            $table->date('tanggal_pengiriman')->nullable();
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('catatan')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->foreign('vendor_id')
                ->references('id')->on('vendors')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
