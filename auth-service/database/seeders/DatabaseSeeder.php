<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Superadmin default — ganti password setelah deploy!
        User::firstOrCreate(
            ['email' => 'superadmin@anyartech.com'],
            [
                'name'      => 'Super Admin',
                'password'  => Hash::make('password123'),
                'role'      => 'superadmin',
                'branch_id' => null,
                'is_active' => true,
            ]
        );

        $this->command->info('✅ Superadmin default dibuat: superadmin@anyartech.com / password123');
    }
}
