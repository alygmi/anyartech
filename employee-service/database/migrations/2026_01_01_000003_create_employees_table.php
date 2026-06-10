<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('nik', 20)->unique()->comment('Nomor Induk Karyawan');
            $table->string('name', 150);
            $table->string('email', 150)->unique();
            $table->string('phone', 20)->nullable();
            $table->enum('gender', ['male', 'female']);
            $table->date('birth_date')->nullable();
            $table->string('address', 255)->nullable();
            $table->foreignId('branch_id')->constrained('branches');
            $table->foreignId('position_id')->constrained('positions');
            $table->enum('contract_type', ['permanent', 'contract', 'intern'])->default('contract');
            $table->date('join_date');
            $table->date('contract_end_date')->nullable()->comment('Null jika karyawan tetap');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
