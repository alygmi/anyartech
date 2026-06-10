<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('email', 150)->unique();
            $table->string('password', 255);
            $table->enum('role', [
                'superadmin',
                'admin_hrd',
                'admin_cabang',
                'karyawan',
                'admin_purchasing',
                'staff_purchasing',
            ])->default('karyawan');
            // branch_id adalah referensi LOGIS ke db_hrm.branches — bukan FK fisik
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->tinyInteger('is_active')->default(1);
            $table->timestamps();
        });

        // Tabel blacklist untuk refresh token yang sudah di-logout
        Schema::create('token_blacklists', function (Blueprint $table) {
            $table->id();
            $table->string('token_jti', 255)->unique()->comment('JWT ID dari refresh token');
            $table->timestamp('expires_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('token_blacklists');
        Schema::dropIfExists('users');
    }
};
