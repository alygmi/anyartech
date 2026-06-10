<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;

class PoNumberGenerator
{
    /**
     * Generate nomor PO atomik supaya tidak ada race condition.
     *
     * Format: PO/{KODE_CABANG}/{TAHUN}/{NOMOR_URUT 4-digit}
     * Contoh: PO/BDG/2026/0001
     *
     * Nomor urut di-reset per (branch_code + tahun).
     */
    public function generate(string $branchCode, ?int $year = null): string
    {
        $year      = $year ?? now()->year;
        $cleanCode = $this->sanitizeBranchCode($branchCode);

        return DB::transaction(function () use ($cleanCode, $year) {
            $prefix = "PO/{$cleanCode}/{$year}/";

            $last = PurchaseOrder::where('po_number', 'like', $prefix . '%')
                ->lockForUpdate()
                ->orderByDesc('po_number')
                ->value('po_number');

            $nextSequence = $last
                ? $this->extractSequence($last) + 1
                : 1;

            return $prefix . str_pad($nextSequence, 4, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Parse branch code dari nomor PO yang sudah ada.
     * Contoh: "PO/BDG/2026/0001" → "BDG"
     */
    public function parseBranchCode(string $poNumber): ?string
    {
        $parts = explode('/', $poNumber);

        return isset($parts[1]) ? strtoupper($parts[1]) : null;
    }

    /**
     * Parse tahun dari nomor PO.
     * Contoh: "PO/BDG/2026/0001" → 2026
     */
    public function parseYear(string $poNumber): ?int
    {
        $parts = explode('/', $poNumber);

        return isset($parts[2]) && is_numeric($parts[2])
            ? (int) $parts[2]
            : null;
    }

    /**
     * Validasi apakah string adalah nomor PO yang valid.
     */
    public function isValid(string $poNumber): bool
    {
        return (bool) preg_match('/^PO\/[A-Z0-9]{1,20}\/\d{4}\/\d{4,}$/', $poNumber);
    }

    private function sanitizeBranchCode(string $code): string
    {
        return strtoupper(preg_replace('/[^A-Z0-9]/i', '', $code));
    }

    private function extractSequence(string $poNumber): int
    {
        $parts = explode('/', $poNumber);
        $last  = end($parts);

        return (int) $last;
    }
}
