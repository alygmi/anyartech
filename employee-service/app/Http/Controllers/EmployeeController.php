<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    // GET /employees
    public function index(Request $request): JsonResponse
    {
        $employees = Employee::with(['branch:id,name,code', 'position:id,name,code'])
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('nik', 'like', "%{$request->search}%"))
            ->when($request->branch_id, fn($q) => $q->where('branch_id', $request->branch_id))
            ->when($request->position_id, fn($q) => $q->where('position_id', $request->position_id))
            ->when($request->has('is_active'), fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate($request->get('per_page', 15));

        return response()->json(['message' => 'OK', 'data' => $employees]);
    }

    // GET /employees/expiring-contracts
    // Karyawan kontrak yang akan berakhir dalam N hari ke depan
    public function expiringContracts(Request $request): JsonResponse
    {
        $days = (int) $request->get('days', 30);

        $employees = Employee::with(['branch:id,name,code', 'position:id,name,code'])
            ->where('contract_type', 'contract')
            ->where('is_active', true)
            ->whereBetween('contract_end_date', [
                Carbon::today(),
                Carbon::today()->addDays($days),
            ])
            ->orderBy('contract_end_date')
            ->get();

        return response()->json([
            'message' => 'OK',
            'data'    => $employees,
            'meta'    => [
                'days'  => $days,
                'total' => $employees->count(),
            ],
        ]);
    }

    // POST /employees
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nik'               => 'required|string|max:20|unique:employees,nik',
            'name'              => 'required|string|max:150',
            'email'             => 'required|email|unique:employees,email',
            'phone'             => 'nullable|string|max:20',
            'gender'            => 'required|in:male,female',
            'birth_date'        => 'nullable|date',
            'address'           => 'nullable|string|max:255',
            'branch_id'         => 'required|exists:branches,id',
            'position_id'       => 'required|exists:positions,id',
            'contract_type'     => 'required|in:permanent,contract,intern',
            'join_date'         => 'required|date',
            'contract_end_date' => 'nullable|date|after:join_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $validator->errors()], 422);
        }

        $employee = Employee::create($request->all());

        return response()->json([
            'message' => 'Karyawan berhasil ditambahkan.',
            'data'    => $employee->load(['branch:id,name,code', 'position:id,name,code']),
        ], 201);
    }

    // GET /employees/{id}
    public function show(int $id): JsonResponse
    {
        $employee = Employee::with(['branch', 'position'])->findOrFail($id);

        return response()->json(['message' => 'OK', 'data' => $employee]);
    }

    // PUT /employees/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nik'               => "sometimes|string|max:20|unique:employees,nik,{$id}",
            'name'              => 'sometimes|string|max:150',
            'email'             => "sometimes|email|unique:employees,email,{$id}",
            'phone'             => 'nullable|string|max:20',
            'gender'            => 'sometimes|in:male,female',
            'birth_date'        => 'nullable|date',
            'address'           => 'nullable|string|max:255',
            'branch_id'         => 'sometimes|exists:branches,id',
            'position_id'       => 'sometimes|exists:positions,id',
            'contract_type'     => 'sometimes|in:permanent,contract,intern',
            'join_date'         => 'sometimes|date',
            'contract_end_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $validator->errors()], 422);
        }

        $employee->update($request->all());

        return response()->json([
            'message' => 'Data karyawan berhasil diperbarui.',
            'data'    => $employee->fresh()->load(['branch:id,name,code', 'position:id,name,code']),
        ]);
    }

    // PATCH /employees/{id}/toggle-active
    public function toggleActive(int $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        $employee->update(['is_active' => ! $employee->is_active]);

        $status = $employee->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json(['message' => "Karyawan berhasil {$status}.", 'data' => $employee->fresh()]);
    }
}
