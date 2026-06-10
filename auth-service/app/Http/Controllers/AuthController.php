<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    /**
     * POST /auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $result = $this->authService->login(
                $request->email,
                $request->password
            );

            return response()->json([
                'message' => 'Login berhasil.',
                'data'    => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $this->exceptionStatus($e));
        }
    }

    /**
     * POST /auth/refresh
     */
    public function refresh(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'refresh_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'refresh_token wajib diisi.',
            ], 422);
        }

        try {
            $result = $this->authService->refresh($request->refresh_token);

            return response()->json([
                'message' => 'Token diperbarui.',
                'data'    => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $this->exceptionStatus($e));
        }
    }

    /**
     * POST /auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'refresh_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'refresh_token wajib diisi.',
            ], 422);
        }

        $this->authService->logout($request->refresh_token);

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * GET /auth/me
     *
     * Endpoint ini dipanggil oleh service lain (Employee, Purchasing)
     * untuk memvalidasi access token dan mendapatkan data user.
     */
    public function me(Request $request): JsonResponse
    {
        // Middleware 'auth.jwt' sudah memvalidasi token sebelum sampai sini
        $user = $request->user();

        return response()->json([
            'message' => 'OK',
            'data'    => [
                'id'        => $user->id,
                'name'      => $user->name,
                'email'     => $user->email,
                'role'      => $user->role,
                'branch_id' => $user->branch_id,
                'is_active' => $user->is_active,
            ],
        ]);
    }

    private function exceptionStatus(\Exception $e): int
    {
        $code = $e->getCode();

        return is_int($code) && $code >= 400 && $code < 600 ? $code : 500;
    }
}
