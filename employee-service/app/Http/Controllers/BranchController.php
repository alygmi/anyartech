<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BranchController extends Controller
{
    // GET /branches — list semua cabang (flat, dengan paginasi)
    public function index(Request $request): JsonResponse
    {
        $branches = Branch::with('parent:id,name,code')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('code', 'like', "%{$request->search}%"))
            ->when($request->has('is_active'), fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate($request->get('per_page', 15));

        return response()->json(['message' => 'OK', 'data' => $branches]);
    }

    // GET /branches/tree — struktur tree (dipakai frontend untuk tampilan hierarki)
    public function tree(): JsonResponse
    {
        $branches = Branch::with('allChildren')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['message' => 'OK', 'data' => $branches]);
    }

    // GET /branches/active — list cabang aktif tanpa paginasi
    // Endpoint ini yang dipanggil Purchasing Service
    public function active(): JsonResponse
    {
        $branches = Branch::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return response()->json(['message' => 'OK', 'data' => $branches]);
    }

    // POST /branches
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:150',
            'code'      => 'required|string|max:20|unique:branches,code',
            'address'   => 'nullable|string|max:255',
            'phone'     => 'nullable|string|max:20',
            'parent_id' => 'nullable|exists:branches,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $validator->errors()], 422);
        }

        $branch = Branch::create($request->only(['name', 'code', 'address', 'phone', 'parent_id']));

        return response()->json(['message' => 'Cabang berhasil dibuat.', 'data' => $branch], 201);
    }

    // GET /branches/{id}
    public function show(int $id): JsonResponse
    {
        $branch = Branch::with(['parent:id,name,code', 'children:id,name,code,parent_id'])->findOrFail($id);

        return response()->json(['message' => 'OK', 'data' => $branch]);
    }

    // PUT /branches/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $branch = Branch::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'      => 'sometimes|string|max:150',
            'code'      => "sometimes|string|max:20|unique:branches,code,{$id}",
            'address'   => 'nullable|string|max:255',
            'phone'     => 'nullable|string|max:20',
            'parent_id' => "nullable|exists:branches,id|not_in:{$id}", // tidak bisa jadi parent diri sendiri
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $validator->errors()], 422);
        }

        $branch->update($request->only(['name', 'code', 'address', 'phone', 'parent_id']));

        return response()->json(['message' => 'Cabang berhasil diperbarui.', 'data' => $branch->fresh()]);
    }

    // PATCH /branches/{id}/toggle-active
    public function toggleActive(int $id): JsonResponse
    {
        $branch = Branch::findOrFail($id);
        $branch->update(['is_active' => ! $branch->is_active]);

        $status = $branch->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json(['message' => "Cabang berhasil {$status}.", 'data' => $branch->fresh()]);
    }
}
