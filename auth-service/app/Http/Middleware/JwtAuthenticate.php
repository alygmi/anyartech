<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;

class JwtAuthenticate
{
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $request->setUserResolver(fn () => $user);
        } catch (TokenExpiredException $e) {
            return response()->json(['message' => 'Token kedaluwarsa.'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['message' => 'Token tidak valid.'], 401);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Token tidak ditemukan.'], 401);
        }

        if (! $user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Akun tidak aktif.'], 403);
        }

        // Cek role jika middleware dipanggil dengan parameter
        // Contoh: middleware('auth.jwt:superadmin') atau middleware('auth.jwt:superadmin,admin_hrd')
        if (! empty($roles) && ! in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Akses ditolak. Role Anda tidak memiliki izin untuk aksi ini.',
            ], 403);
        }

        return $next($request);
    }
}
