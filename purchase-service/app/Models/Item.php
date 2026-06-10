<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    protected $fillable = [
        'code', 'name', 'description', 'category',
        'unit', 'default_vendor_id', 'last_price', 'is_active',
    ];

    protected $casts = [
        'is_active'   => 'boolean',
        'last_price'  => 'decimal:2',
    ];

    // ── Scopes ──────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }

    public function scopeSearch($query, ?string $keyword)
    {
        if ($keyword) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                  ->orWhere('code', 'like', "%{$keyword}%");
            });
        }

        return $query;
    }

    public function scopeByCategory($query, ?string $category)
    {
        if ($category) {
            $query->where('category', $category);
        }

        return $query;
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function defaultVendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'default_vendor_id');
    }

    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
