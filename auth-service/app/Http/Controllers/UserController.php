<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * GET /users
     * Daftar semua user dengan paginasi.
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->when($request->is_active !== null, fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->when($request->search, fn($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'message' => 'OK',
            'data'    => $users,
        ]);
    }

    /**
     * POST /users
     * Tambah user baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:150',
            'email'     => 'required|email|max:150|unique:users,email',
            'password'  => 'required|string|min:8',
            'role'      => 'required|in:superadmin,admin_hrd,admin_cabang,karyawan,admin_purchasing,staff_purchasing',
            'branch_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => $request->role,
            'branch_id' => $request->branch_id,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'User berhasil dibuat.',
            'data'    => $user,
        ], 201);
    }

    /**
     * GET /users/{id}
     */
    public function show(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json([
            'message' => 'OK',
            'data'    => $user,
        ]);
    }

    /**
     * PUT /users/{id}
     * Update role dan branch_id user.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'      => 'sometimes|string|max:150',
            'email'     => "sometimes|email|max:150|unique:users,email,{$id}",
            'password'  => 'sometimes|string|min:8',
            'role'      => 'sometimes|in:superadmin,admin_hrd,admin_cabang,karyawan,admin_purchasing,staff_purchasing',
            'branch_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = $request->only(['name', 'email', 'role', 'branch_id']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'message' => 'User berhasil diperbarui.',
            'data'    => $user->fresh(),
        ]);
    }

    /**
     * PATCH /users/{id}/toggle-active
     * Aktifkan atau nonaktifkan user.
     */
    public function toggleActive(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => ! $user->is_active]);

        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'message' => "User berhasil {$status}.",
            'data'    => $user->fresh(),
        ]);
    }
}
