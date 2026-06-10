<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateFromAuthService
{
    /**
     * Validate incoming JWT by calling GET /auth/me on Auth Service.
     * Injects auth.user into the request attributes on success.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->extractToken($request);

        if (! $token) {
            return response()->json(['message' => 'Token not provided.'], 401);
        }

        try {
            $response = Http::withToken($token)
                ->timeout(5)
                ->get(rtrim(config('services.auth_service.base_url'), '/') . '/api/auth/me');
        } catch (\Exception $e) {
            return response()->json(['message' => 'Auth service unreachable.'], 503);
        }

        if ($response->status() === 401) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! $response->successful()) {
            return response()->json(['message' => 'Auth service error.'], 502);
        }

        $user = $response->json('data') ?? $response->json();

        // Attach user payload so controllers can access it
        $request->attributes->set('auth_user', $user);

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        $bearer = $request->bearerToken();
        if ($bearer) {
            return $bearer;
        }

        // fallback: ?token=xxx (useful for testing)
        return $request->query('token');
    }
}
