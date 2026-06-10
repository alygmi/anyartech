<?php

namespace App\Services;

use App\Models\TokenBlacklist;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class AuthService
{
    /**
     * Login — kembalikan access token + refresh token.
     *
     * Kenapa dua token?
     * - Access token: short-lived (15 menit), dipakai untuk tiap request API
     * - Refresh token: long-lived (7 hari), hanya dipakai untuk minta access token baru
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new \Exception('Email atau password salah.', 401);
        }

        if (! $user->is_active) {
            throw new \Exception('Akun tidak aktif. Hubungi administrator.', 403);
        }

        $accessToken  = $this->generateAccessToken($user);
        $refreshToken = $this->generateRefreshToken($user);

        return [
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type'    => 'Bearer',
            'expires_in'    => config('jwt.ttl') * 60, // dalam detik
        ];
    }

    /**
     * Refresh — validasi refresh token, cek blacklist, lalu terbitkan access token baru.
     */
    public function refresh(string $refreshToken): array
    {
        try {
            // Set token yang mau diparse ke refresh token
            $payload = JWTAuth::setToken($refreshToken)->getPayload();
        } catch (TokenExpiredException $e) {
            throw new \Exception('Refresh token sudah kedaluwarsa. Silakan login ulang.', 401);
        } catch (TokenInvalidException $e) {
            throw new \Exception('Refresh token tidak valid.', 401);
        }

        // Pastikan ini memang refresh token, bukan access token
        if (($payload->get('type') ?? 'access') !== 'refresh') {
            throw new \Exception('Token yang diberikan bukan refresh token.', 401);
        }

        // Cek apakah token sudah di-blacklist (sudah pernah logout)
        $jti = $payload->get('jti');
        if (TokenBlacklist::where('token_jti', $jti)->exists()) {
            throw new \Exception('Refresh token sudah tidak berlaku.', 401);
        }

        $user = User::findOrFail($payload->get('sub'));

        if (! $user->is_active) {
            throw new \Exception('Akun tidak aktif.', 403);
        }

        return [
            'access_token' => $this->generateAccessToken($user),
            'token_type'   => 'Bearer',
            'expires_in'   => config('jwt.ttl') * 60,
        ];
    }

    /**
     * Logout — masukkan JTI refresh token ke blacklist supaya tidak bisa dipakai lagi.
     */
    public function logout(string $refreshToken): void
    {
        try {
            $payload = JWTAuth::setToken($refreshToken)->getPayload();
        } catch (\Exception $e) {
            // Token sudah expired atau invalid — tetap anggap logout berhasil
            return;
        }

        $jti       = $payload->get('jti');
        $expiresAt = Carbon::createFromTimestamp($payload->get('exp'));

        // Simpan ke DB (fallback jika Redis mati)
        TokenBlacklist::firstOrCreate(
            ['token_jti' => $jti],
            ['expires_at' => $expiresAt]
        );
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function generateAccessToken(User $user): string
    {
        return JWTAuth::claims(['type' => 'access'])->fromUser($user);
    }

    private function generateRefreshToken(User $user): string
    {
        $refreshTtl = (int) config('jwt.refresh_ttl', 10080);

        JWTAuth::factory()->setTTL($refreshTtl);

        return JWTAuth::claims(['type' => 'refresh'])->fromUser($user);
    }
}
