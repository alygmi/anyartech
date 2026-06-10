<?php

namespace App\Http\Controllers;

use App\Http\Requests\Vendor\StoreVendorRequest;
use App\Http\Requests\Vendor\UpdateVendorRequest;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Vendor::query()
            ->search($request->query('search'))
            ->when(
                $request->has('is_active'),
                fn ($q) => $q->where('is_active', (int) $request->query('is_active'))
            )
            ->orderBy('name');

        $vendors = $query->paginate($request->query('per_page', 15));

        return response()->json($vendors);
    }

    public function store(StoreVendorRequest $request): JsonResponse
    {
        $this->authorizeManage($request->attributes->get('auth_user'));

        $vendor = Vendor::create($request->validated());

        return response()->json([
            'message' => 'Vendor created.',
            'data'    => $vendor,
        ], 201);
    }

    public function show(Vendor $vendor): JsonResponse
    {
        return response()->json(['data' => $vendor]);
    }

    public function update(UpdateVendorRequest $request, Vendor $vendor): JsonResponse
    {
        $this->authorizeManage($request->attributes->get('auth_user'));

        $vendor->update($request->validated());

        return response()->json([
            'message' => 'Vendor updated.',
            'data'    => $vendor->fresh(),
        ]);
    }

    public function destroy(Request $request, Vendor $vendor): JsonResponse
    {
        $this->authorizeManage($request->attributes->get('auth_user'));

        $vendor->update(['is_active' => 0]);

        return response()->json(['message' => 'Vendor deactivated.']);
    }

    /**
     * GET /vendors/{id}/purchase-history
     */
    public function purchaseHistory(Request $request, Vendor $vendor): JsonResponse
    {
        $user = $request->attributes->get('auth_user');

        $query = $vendor->purchaseOrders()
            ->with('items')
            ->orderByDesc('tanggal_po');

        if (in_array($user['role'] ?? '', ['admin_cabang', 'staff_purchasing'], true)) {
            $query->byBranch((int) $user['branch_id']);
        }

        $pos = $query->paginate($request->query('per_page', 15));

        return response()->json($pos);
    }

    private function authorizeManage(array $user): void
    {
        abort_unless(
            in_array($user['role'] ?? '', ['admin_purchasing', 'superadmin'], true),
            403,
            'Forbidden.'
        );
    }
}
