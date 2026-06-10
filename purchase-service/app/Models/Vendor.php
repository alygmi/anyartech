<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vendor extends Model
{
    protected $fillable = [
        'name', 'code', 'contact_person', 'phone',
        'email', 'address', 'npwp', 'payment_term_days', 'is_active',
    ];

    protected $casts = [
        'is_active'          => 'boolean',
        'payment_term_days'  => 'integer',
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

    // ── Relationships ────────────────────────────────────────────────────────

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'default_vendor_id');
    }
}
