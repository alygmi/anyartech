<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $fillable = [
        'name',
        'code',
        'address',
        'phone',
        'parent_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relasi ke parent branch (cabang atasan)
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'parent_id');
    }

    // Relasi ke child branches (cabang bawahan)
    public function children(): HasMany
    {
        return $this->hasMany(Branch::class, 'parent_id');
    }

    // Recursive: ambil semua cabang bawahan sampai level terbawah
    public function allChildren(): HasMany
    {
        return $this->children()->with('allChildren');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
