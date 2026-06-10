<?php

namespace App\Services;

use App\Models\Item;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseOrderService
{
    public function __construct(
        private readonly PoNumberGenerator $poNumberGenerator,
        private readonly EmployeeServiceClient $employeeClient,
    ) {}

    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = PurchaseOrder::with(['vendor', 'items.item'])
            ->when(isset($filters['status']), fn ($q) => $q->where('status', $filters['status']))
            ->when(isset($filters['branch_id']), fn ($q) => $q->where('branch_id', $filters['branch_id']))
            ->when(isset($filters['vendor_id']), fn ($q) => $q->where('vendor_id', $filters['vendor_id']))
            ->when(isset($filters['date_from']), fn ($q) => $q->whereDate('tanggal_po', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn ($q) => $q->whereDate('tanggal_po', '<=', $filters['date_to']));

        if (isset($filters['restrict_branch_id'])) {
            $query->where('branch_id', $filters['restrict_branch_id']);
        }

        return $query->latest()->paginate($perPage);
    }

    public function findOrFail(int $id): PurchaseOrder
    {
        return PurchaseOrder::with(['vendor', 'items.item'])->findOrFail($id);
    }

    public function create(array $data, int $requestedBy): PurchaseOrder
    {
        $branch = $this->resolveBranch($data['branch_id']);

        return DB::transaction(function () use ($data, $requestedBy, $branch) {
            $poNumber = $this->poNumberGenerator->generate(
                $branch['code'],
                now()->year
            );

            $po = PurchaseOrder::create([
                'po_number'          => $poNumber,
                'branch_id'          => $branch['id'],
                'branch_name'        => $branch['name'],
                'branch_code'        => $branch['code'],
                'vendor_id'          => $data['vendor_id'],
                'requested_by'       => $requestedBy,
                'status'             => PurchaseOrder::STATUS_DRAFT,
                'tanggal_po'         => $data['tanggal_po'] ?? now()->toDateString(),
                'tanggal_dibutuhkan' => $data['tanggal_dibutuhkan'] ?? null,
                'catatan'            => $data['catatan'] ?? null,
                'total_amount'       => 0,
            ]);

            if (!empty($data['items'])) {
                $this->syncItems($po, $data['items']);
            }

            return $po->fresh(['vendor', 'items.item']);
        });
    }

    public function updateItems(PurchaseOrder $po, array $items): PurchaseOrder
    {
        $this->assertStatus($po, PurchaseOrder::STATUS_DRAFT, 'edit items');

        DB::transaction(function () use ($po, $items) {
            $this->syncItems($po, $items);
        });

        return $po->fresh(['vendor', 'items.item']);
    }

    public function submit(PurchaseOrder $po): PurchaseOrder
    {
        $this->assertStatus($po, PurchaseOrder::STATUS_DRAFT, 'submit');

        if ($po->items()->count() === 0) {
            throw ValidationException::withMessages([
                'items' => 'PO harus memiliki minimal 1 item sebelum dapat di-submit.',
            ]);
        }

        $po->update(['status' => PurchaseOrder::STATUS_SUBMITTED]);

        return $po->fresh();
    }

    public function approve(PurchaseOrder $po, int $approvedBy): PurchaseOrder
    {
        $this->assertStatus($po, PurchaseOrder::STATUS_SUBMITTED, 'approve');

        $po->update([
            'status'      => PurchaseOrder::STATUS_APPROVED,
            'approved_by' => $approvedBy,
            'approved_at' => now(),
        ]);

        return $po->fresh();
    }

    public function reject(PurchaseOrder $po, string $reason, int $approvedBy): PurchaseOrder
    {
        $this->assertStatus($po, PurchaseOrder::STATUS_SUBMITTED, 'reject');

        $po->update([
            'status'           => PurchaseOrder::STATUS_REJECTED,
            'rejection_reason' => $reason,
            'approved_by'      => $approvedBy,
            'approved_at'      => now(),
        ]);

        return $po->fresh();
    }

    public function receive(PurchaseOrder $po, ?string $tanggalPengiriman = null): PurchaseOrder
    {
        $this->assertStatus($po, PurchaseOrder::STATUS_APPROVED, 'receive');

        DB::transaction(function () use ($po, $tanggalPengiriman) {
            $po->update([
                'status'             => PurchaseOrder::STATUS_RECEIVED,
                'tanggal_pengiriman' => $tanggalPengiriman ?? now()->toDateString(),
            ]);

            $this->updateLastPrices($po);
        });

        return $po->fresh(['vendor', 'items.item']);
    }

    public function cancel(PurchaseOrder $po): PurchaseOrder
    {
        $allowedStatuses = [
            PurchaseOrder::STATUS_DRAFT,
            PurchaseOrder::STATUS_SUBMITTED,
        ];

        if (!in_array($po->status, $allowedStatuses)) {
            throw ValidationException::withMessages([
                'status' => "PO dengan status '{$po->status}' tidak dapat dibatalkan.",
            ]);
        }

        $po->update(['status' => PurchaseOrder::STATUS_CANCELLED]);

        return $po->fresh();
    }

    private function syncItems(PurchaseOrder $po, array $items): void
    {
        $po->items()->delete();

        $total = 0;

        foreach ($items as $itemData) {
            $masterItem = Item::findOrFail($itemData['item_id']);

            $subtotal = round($itemData['quantity'] * $itemData['unit_price'], 2);
            $total   += $subtotal;

            PurchaseOrderItem::create([
                'purchase_order_id' => $po->id,
                'item_id'           => $masterItem->id,
                'item_name'         => $masterItem->name,
                'quantity'          => $itemData['quantity'],
                'unit'              => $itemData['unit'] ?? $masterItem->unit,
                'unit_price'        => $itemData['unit_price'],
                'subtotal'          => $subtotal,
                'notes'             => $itemData['notes'] ?? null,
            ]);
        }

        $po->update(['total_amount' => $total]);
    }

    private function updateLastPrices(PurchaseOrder $po): void
    {
        foreach ($po->items as $poItem) {
            Item::where('id', $poItem->item_id)
                ->update(['last_price' => $poItem->unit_price]);
        }
    }

    private function resolveBranch(int $branchId): array
    {
        $branch = $this->employeeClient->getBranchById($branchId);

        if (!$branch) {
            throw ValidationException::withMessages([
                'branch_id' => 'Cabang tidak ditemukan atau Employee Service tidak tersedia.',
            ]);
        }

        if (isset($branch['is_active']) && !$branch['is_active']) {
            throw ValidationException::withMessages([
                'branch_id' => 'Cabang tidak aktif dan tidak dapat membuat PO.',
            ]);
        }

        return $branch;
    }

    private function assertStatus(PurchaseOrder $po, string $expected, string $action): void
    {
        if ($po->status !== $expected) {
            throw ValidationException::withMessages([
                'status' => "Tidak dapat {$action} PO dengan status '{$po->status}'. Status yang dibutuhkan: '{$expected}'.",
            ]);
        }
    }
}
