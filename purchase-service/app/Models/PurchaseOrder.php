<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    public const STATUS_DRAFT     = 'draft';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_APPROVED  = 'approved';
    public const STATUS_REJECTED  = 'rejected';
    public const STATUS_RECEIVED  = 'received';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'po_number', 'branch_id', 'branch_name', 'branch_code',
        'vendor_id', 'requested_by', 'status',
        'tanggal_po', 'tanggal_dibutuhkan', 'tanggal_pengiriman',
        'total_amount', 'catatan', 'rejection_reason',
        'approved_by', 'approved_at',
    ];

    protected $casts = [
        'tanggal_po'          => 'date',
        'tanggal_dibutuhkan'  => 'date',
        'tanggal_pengiriman'  => 'date',
        'approved_at'         => 'datetime',
        'total_amount'        => 'decimal:2',
    ];

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function isEditable(): bool
    {
        return $this->isDraft();
    }

    public function isCancellable(): bool
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_SUBMITTED]);
    }

    public function recalculateTotal(): void
    {
        $this->total_amount = $this->items()->sum('subtotal');
        $this->save();
    }

    // ── Scopes ──────────────────────────────────────────────────────────────

    public function scopeByStatus($query, ?string $status)
    {
        if ($status) {
            $query->where('status', $status);
        }

        return $query;
    }

    public function scopeByBranch($query, ?int $branchId)
    {
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query;
    }

    public function scopeByVendor($query, ?int $vendorId)
    {
        if ($vendorId) {
            $query->where('vendor_id', $vendorId);
        }

        return $query;
    }

    public function scopeByDateRange($query, ?string $from, ?string $to)
    {
        if ($from) {
            $query->whereDate('tanggal_po', '>=', $from);
        }
        if ($to) {
            $query->whereDate('tanggal_po', '<=', $to);
        }

        return $query;
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
