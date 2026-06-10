<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'branch_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'branch_id' => 'integer',
    ];

    // --- JWTSubject interface ---

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * Custom claims yang bakal masuk ke dalam payload JWT.
     * Service lain (Employee, Purchasing) akan baca 'role' dan 'branch_id'
     * langsung dari token — tanpa perlu query db_auth.
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'role'      => $this->role,
            'branch_id' => $this->branch_id,
            'name'      => $this->name,
        ];
    }
}
