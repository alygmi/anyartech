<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class JwtAuthenticate
{
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        try {
            // Decode token langsung dari JWT_SECRET yang sama dengan Auth Service
            // Tidak perlu HTTP call ke Auth Service — payload sudah ada di token
            $payload = JWTAuth::parseToken()->getPayload();
        } catch (TokenExpiredException) {
            return response()->json(['message' => 'Token kedaluwarsa.'], 401);
        } catch (TokenInvalidException) {
            return response()->json(['message' => 'Token tidak valid.'], 401);
        } catch (\Exception) {
            return response()->json(['message' => 'Token tidak ditemukan.'], 401);
        }

        // Pastikan ini access token, bukan refresh token
        if (($payload->get('type') ?? 'access') !== 'access') {
            return response()->json(['message' => 'Token tidak valid.'], 401);
        }

        // Inject data user ke request supaya bisa dipakai di controller
        $request->merge([
            'auth_user_id'  => $payload->get('sub'),
            'auth_role'     => $payload->get('role'),
            'auth_branch_id'=> $payload->get('branch_id'),
            'auth_name'     => $payload->get('name'),
        ]);

        // Cek role jika middleware dipanggil dengan parameter
        if (! empty($roles) && ! in_array($payload->get('role'), $roles)) {
            return response()->json([
                'message' => 'Akses ditolak. Role Anda tidak memiliki izin.',
            ], 403);
        }

        return $next($request);
    }
}
