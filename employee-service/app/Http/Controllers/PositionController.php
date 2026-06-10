<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PositionController extends Controller
{
    // GET /positions
    public function index(Request $request): JsonResponse
    {
        $positions = Position::with('parent:id,name,code')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->has('is_active'), fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate($request->get('per_page', 15));

        return response()->json(['message' => 'OK', 'data' => $positions]);
    }

    // GET /positions/tree
    public function tree(): JsonResponse
    {
        $positions = Position::with('allChildren')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['message' => 'OK', 'data' => $positions]);
    }

    // POST /positions
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:150',
            'code'      => 'required|string|max:20|unique:positions,code',
            'parent_id' => 'nullable|exists:positions,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $validator->errors()], 422);
        }

        $position = Position::create($request->only(['name', 'code', 'parent_id']));

        return response()->json(['message' => 'Jabatan berhasil dibuat.', 'data' => $position], 201);
    }

    // GET /positions/{id}
    public function show(int $id): JsonResponse
    {
        $position = Position::with(['parent:id,name,code', 'children:id,name,code,parent_id'])->findOrFail($id);

        return response()->json(['message' => 'OK', 'data' => $position]);
    }

    // PUT /positions/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $position = Position::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'      => 'sometimes|string|max:150',
            'code'      => "sometimes|string|max:20|unique:positions,code,{$id}",
            'parent_id' => "nullable|exists:positions,id|not_in:{$id}",
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $validator->errors()], 422);
        }

        $position->update($request->only(['name', 'code', 'parent_id']));

        return response()->json(['message' => 'Jabatan berhasil diperbarui.', 'data' => $position->fresh()]);
    }

    // PATCH /positions/{id}/toggle-active
    public function toggleActive(int $id): JsonResponse
    {
        $position = Position::findOrFail($id);
        $position->update(['is_active' => ! $position->is_active]);

        $status = $position->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json(['message' => "Jabatan berhasil {$status}.", 'data' => $position->fresh()]);
    }
}
