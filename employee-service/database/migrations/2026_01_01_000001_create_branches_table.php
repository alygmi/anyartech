<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('code', 20)->unique()->comment('Kode unik cabang, contoh: JKT-01');
            $table->string('address', 255)->nullable();
            $table->string('phone', 20)->nullable();
            // Self-referencing: cabang bisa punya parent cabang
            // Null berarti ini cabang paling atas (pusat)
            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('branches')
                  ->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
