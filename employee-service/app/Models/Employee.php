<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    protected $fillable = [
        'nik',
        'name',
        'email',
        'phone',
        'gender',
        'birth_date',
        'address',
        'branch_id',
        'position_id',
        'contract_type',
        'join_date',
        'contract_end_date',
        'is_active',
    ];

    protected $casts = [
        'birth_date'        => 'date',
        'join_date'         => 'date',
        'contract_end_date' => 'date',
        'is_active'         => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }
}
