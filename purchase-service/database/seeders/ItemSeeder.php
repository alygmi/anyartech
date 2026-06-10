<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('items')->truncate();
        Schema::enableForeignKeyConstraints();

        $vendorIds = DB::table('vendors')->orderBy('id')->pluck('id')->toArray();

        $v1 = $vendorIds[0] ?? 1;
        $v2 = $vendorIds[1] ?? 2;
        $v3 = $vendorIds[2] ?? 3;
        $v4 = $vendorIds[3] ?? 4;

        $items = [
            [
                'code'              => 'ITM-0001',
                'name'              => 'Kertas HVS A4 80gr',
                'description'       => 'Kertas HVS ukuran A4, gramatur 80gr, 500 lembar/rim',
                'category'          => 'ATK',
                'unit'              => 'rim',
                'default_vendor_id' => $v2,
                'last_price'        => 55000.00,
                'is_active'         => 1,
            ],
            [
                'code'              => 'ITM-0002',
                'name'              => 'Pulpen Ballpoint Biru',
                'description'       => 'Pulpen tinta biru, 1 box isi 10 pcs',
                'category'          => 'ATK',
                'unit'              => 'box',
                'default_vendor_id' => $v2,
                'last_price'        => 25000.00,
                'is_active'         => 1,
            ],
            [
                'code'              => 'ITM-0003',
                'name'              => 'Tinta Printer Canon Black',
                'description'       => 'Tinta printer Canon warna hitam, kompatibel PG-810',
                'category'          => 'ATK',
                'unit'              => 'pcs',
                'default_vendor_id' => $v4,
                'last_price'        => 85000.00,
                'is_active'         => 1,
            ],
            [
                'code'              => 'ITM-0004',
                'name'              => 'Map Snelhecter Folio',
                'description'       => 'Map plastik dengan penjepit besi, ukuran folio',
                'category'          => 'ATK',
                'unit'              => 'pcs',
                'default_vendor_id' => $v2,
                'last_price'        => 7500.00,
                'is_active'         => 1,
            ],
            [
                'code'              => 'ITM-0005',
                'name'              => 'UPS APC 650VA',
                'description'       => 'Uninterruptible Power Supply APC 650VA untuk komputer',
                'category'          => 'Elektronik',
                'unit'              => 'unit',
                'default_vendor_id' => $v4,
                'last_price'        => 950000.00,
                'is_active'         => 1,
            ],
            [
                'code'              => 'ITM-0006',
                'name'              => 'Kabel LAN Cat6 Per Meter',
                'description'       => 'Kabel UTP Cat6 untuk jaringan, dihitung per meter',
                'category'          => 'Elektronik',
                'unit'              => 'meter',
                'default_vendor_id' => $v4,
                'last_price'        => 8500.00,
                'is_active'         => 1,
            ],
            [
                'code'              => 'ITM-0007',
                'name'              => 'Kursi Kerja Ergonomis',
                'description'       => 'Kursi kantor dengan sandaran punggung ergonomis, bahan mesh',
                'category'          => 'Furnitur',
                'unit'              => 'unit',
                'default_vendor_id' => $v1,
                'last_price'        => 1250000.00,
                'is_active'         => 1,
            ],
            [
                'code'              => 'ITM-0008',
                'name'              => 'Meja Kerja 120x60cm',
                'description'       => 'Meja kerja kantor ukuran 120x60cm, material kayu MDF',
                'category'          => 'Furnitur',
                'unit'              => 'unit',
                'default_vendor_id' => $v1,
                'last_price'        => 2100000.00,
                'is_active'         => 1,
            ],
            [
                'code'              => 'ITM-0009',
                'name'              => 'Sabun Cuci Tangan 5 Liter',
                'description'       => 'Sabun cuci tangan cair kemasan jerigen 5 liter',
                'category'          => 'Kebersihan',
                'unit'              => 'jerigen',
                'default_vendor_id' => $v3,
                'last_price'        => 75000.00,
                'is_active'         => 1,
            ],
            [
                'code'              => 'ITM-0010',
                'name'              => 'Tisu Toilet 1 Lusin',
                'description'       => 'Tisu toilet 2 ply, 1 lusin (12 roll)',
                'category'          => 'Kebersihan',
                'unit'              => 'lusin',
                'default_vendor_id' => $v3,
                'last_price'        => 48000.00,
                'is_active'         => 1,
            ],
            [
                'code'              => 'ITM-0011',
                'name'              => 'Cairan Pembersih Lantai 1L',
                'description'       => 'Pembersih lantai dengan wangi lavender, kemasan 1 liter',
                'category'          => 'Kebersihan',
                'unit'              => 'botol',
                'default_vendor_id' => $v3,
                'last_price'        => 22000.00,
                'is_active'         => 1,
            ],
            [
                'code'              => 'ITM-0012',
                'name'              => 'Whiteboard 90x120cm (Discontinued)',
                'description'       => 'Whiteboard ukuran 90x120cm — sudah tidak tersedia',
                'category'          => 'Furnitur',
                'unit'              => 'unit',
                'default_vendor_id' => null,
                'last_price'        => null,
                'is_active'         => 0,
            ],
        ];

        $now = now();
        foreach ($items as &$item) {
            $item['created_at'] = $now;
            $item['updated_at'] = $now;
        }

        DB::table('items')->insert($items);

        $this->command->info('✅ Items seeded: ' . count($items) . ' records.');
    }
}
