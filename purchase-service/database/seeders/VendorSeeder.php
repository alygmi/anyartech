<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('vendors')->truncate();
        Schema::enableForeignKeyConstraints();

        $vendors = [
            [
                'name'              => 'PT Maju Bersama Sejahtera',
                'code'              => 'VND-001',
                'contact_person'    => 'Budi Santoso',
                'phone'             => '022-4567890',
                'email'             => 'budi@majubersama.co.id',
                'address'           => 'Jl. Sudirman No. 45, Bandung, Jawa Barat',
                'npwp'              => '01.234.567.8-901.000',
                'payment_term_days' => 30,
                'is_active'         => 1,
            ],
            [
                'name'              => 'CV Karya Mandiri Abadi',
                'code'              => 'VND-002',
                'contact_person'    => 'Siti Rahayu',
                'phone'             => '0812-3456-7890',
                'email'             => 'siti@karyamandiri.com',
                'address'           => 'Jl. Pemuda No. 12, Garut, Jawa Barat',
                'npwp'              => '02.345.678.9-012.000',
                'payment_term_days' => 14,
                'is_active'         => 1,
            ],
            [
                'name'              => 'UD Sumber Rejeki',
                'code'              => 'VND-003',
                'contact_person'    => 'Ahmad Fauzi',
                'phone'             => '0265-456789',
                'email'             => null,
                'address'           => 'Jl. Pahlawan No. 8, Sukabumi, Jawa Barat',
                'npwp'              => null,
                'payment_term_days' => 7,
                'is_active'         => 1,
            ],
            [
                'name'              => 'PT Teknindo Solusi Utama',
                'code'              => 'VND-004',
                'contact_person'    => 'Dewi Lestari',
                'phone'             => '021-7890123',
                'email'             => 'dewi@teknindo.co.id',
                'address'           => 'Jl. Gatot Subroto No. 99, Jakarta Selatan',
                'npwp'              => '04.567.890.1-234.000',
                'payment_term_days' => 45,
                'is_active'         => 1,
            ],
            [
                'name'              => 'CV Toko Peralatan Nusantara',
                'code'              => 'VND-005',
                'contact_person'    => 'Hendra Gunawan',
                'phone'             => '0231-567890',
                'email'             => 'hendra@peralatannus.com',
                'address'           => 'Jl. Diponegoro No. 33, Tasikmalaya, Jawa Barat',
                'npwp'              => null,
                'payment_term_days' => 30,
                'is_active'         => 0,
            ],
        ];

        $now = now();
        foreach ($vendors as &$v) {
            $v['created_at'] = $now;
            $v['updated_at'] = $now;
        }

        DB::table('vendors')->insert($vendors);

        $this->command->info('✅ Vendors seeded: ' . count($vendors) . ' records.');
    }
}
