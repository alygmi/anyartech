<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PurchaseOrderSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('purchase_order_items')->truncate();
        DB::table('purchase_orders')->truncate();
        Schema::enableForeignKeyConstraints();

        $vendorIds = DB::table('vendors')
            ->where('is_active', 1)
            ->orderBy('id')
            ->pluck('id')
            ->toArray();

        $itemIds = DB::table('items')
            ->where('is_active', 1)
            ->orderBy('id')
            ->pluck('id')
            ->toArray();

        if (empty($vendorIds) || empty($itemIds)) {
            $this->command->warn('⚠️  Jalankan VendorSeeder dan ItemSeeder terlebih dahulu.');
            return;
        }

        $branches = [
            ['id' => 1, 'name' => 'Cabang Bandung',     'code' => 'BDG'],
            ['id' => 2, 'name' => 'Cabang Garut',        'code' => 'GRT'],
            ['id' => 3, 'name' => 'Cabang Sukabumi',     'code' => 'SKB'],
            ['id' => 4, 'name' => 'Cabang Tasikmalaya',  'code' => 'TSM'],
        ];

        $now          = now();
        $superadminId = 1;
        $adminPurchId = 2;

        $orders = [
            [
                'po'    => $this->buildPo('BDG', 2026, 1, $branches[0], $vendorIds[0], $superadminId, 'draft', $now->copy()->subDays(3)),
                'items' => $this->sampleItems($itemIds, 2),
            ],
            [
                'po'    => $this->buildPo('GRT', 2026, 1, $branches[1], $vendorIds[1], $superadminId, 'submitted', $now->copy()->subDays(5)),
                'items' => $this->sampleItems($itemIds, 3),
            ],
            [
                'po'    => array_merge(
                    $this->buildPo('SKB', 2026, 1, $branches[2], $vendorIds[0], $superadminId, 'approved', $now->copy()->subDays(7)),
                    ['approved_by' => $adminPurchId, 'approved_at' => $now->copy()->subDays(6)]
                ),
                'items' => $this->sampleItems($itemIds, 2),
            ],
            [
                'po'    => array_merge(
                    $this->buildPo('TSM', 2026, 1, $branches[3], $vendorIds[2], $superadminId, 'rejected', $now->copy()->subDays(10)),
                    [
                        'approved_by'      => $adminPurchId,
                        'approved_at'      => $now->copy()->subDays(9),
                        'rejection_reason' => 'Anggaran tidak mencukupi untuk periode ini.',
                    ]
                ),
                'items' => $this->sampleItems($itemIds, 1),
            ],
            [
                'po'    => array_merge(
                    $this->buildPo('BDG', 2026, 2, $branches[0], $vendorIds[3], $superadminId, 'received', $now->copy()->subDays(15)),
                    [
                        'approved_by'        => $adminPurchId,
                        'approved_at'        => $now->copy()->subDays(13),
                        'tanggal_pengiriman' => $now->copy()->subDays(8)->toDateString(),
                    ]
                ),
                'items' => $this->sampleItems($itemIds, 4),
            ],
            [
                'po'    => $this->buildPo('GRT', 2026, 2, $branches[1], $vendorIds[0], $superadminId, 'cancelled', $now->copy()->subDays(20)),
                'items' => $this->sampleItems($itemIds, 2),
            ],
            [
                'po'    => $this->buildPo('GRT', 2026, 3, $branches[1], $vendorIds[1], 3, 'draft', $now->copy()->subDay()),
                'items' => $this->sampleItems($itemIds, 2),
            ],
        ];

        foreach ($orders as $entry) {
            $poId = DB::table('purchase_orders')->insertGetId($entry['po']);
            $this->insertItems($poId, $entry['items']);
            $total = DB::table('purchase_order_items')
                ->where('purchase_order_id', $poId)
                ->sum('subtotal');
            DB::table('purchase_orders')->where('id', $poId)->update(['total_amount' => $total]);
        }

        $this->command->info('✅ Purchase Orders seeded: ' . count($orders) . ' records.');
    }

    private function buildPo(
        string $branchCode,
        int $year,
        int $seq,
        array $branch,
        int $vendorId,
        int $requestedBy,
        string $status,
        mixed $date,
    ): array {
        return [
            'po_number'          => sprintf('PO/%s/%d/%04d', $branchCode, $year, $seq),
            'branch_id'          => $branch['id'],
            'branch_name'        => $branch['name'],
            'branch_code'        => $branch['code'],
            'vendor_id'          => $vendorId,
            'requested_by'       => $requestedBy,
            'status'             => $status,
            'tanggal_po'         => $date->toDateString(),
            'tanggal_dibutuhkan' => $date->copy()->addDays(14)->toDateString(),
            'tanggal_pengiriman' => null,
            'total_amount'       => 0,
            'catatan'            => 'Data seed untuk testing',
            'rejection_reason'   => null,
            'approved_by'        => null,
            'approved_at'        => null,
            'created_at'         => $date,
            'updated_at'         => $date,
        ];
    }

    private function sampleItems(array $itemIds, int $count): array
    {
        $count = min($count, count($itemIds));

        return array_slice($itemIds, 0, $count);
    }

    private function insertItems(int $poId, array $itemIds): void
    {
        $now = now();
        $unitPrices = [55000, 25000, 85000, 7500, 950000, 8500, 1250000, 2100000, 75000, 48000, 22000];

        foreach ($itemIds as $i => $itemId) {
            $item     = DB::table('items')->find($itemId);
            $qty      = ($i + 1) * 2;
            $price    = $item->last_price ?? ($unitPrices[$i % count($unitPrices)] ?? 50000);
            $subtotal = $qty * $price;

            DB::table('purchase_order_items')->insert([
                'purchase_order_id' => $poId,
                'item_id'           => $itemId,
                'item_name'         => $item->name,
                'quantity'          => $qty,
                'unit'              => $item->unit,
                'unit_price'        => $price,
                'subtotal'          => $subtotal,
                'notes'             => null,
                'created_at'        => $now,
                'updated_at'        => $now,
            ]);
        }
    }
}
