<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TokenBlacklist extends Model
{
    protected $table = 'token_blacklists';

    protected $fillable = [
        'token_jti',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
}
