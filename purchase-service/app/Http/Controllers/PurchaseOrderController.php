<?php

namespace App\Http\Controllers;

use App\Http\Requests\PurchaseOrder\RejectPurchaseOrderRequest;
use App\Http\Requests\PurchaseOrder\StorePurchaseOrderRequest;
use App\Http\Requests\PurchaseOrder\UpdatePurchaseOrderItemsRequest;
use App\Models\PurchaseOrder;
use App\Services\EmployeeServiceClient;
use App\Services\PurchaseOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PurchaseOrderController extends Controller
{
    public function __construct(
        private readonly PurchaseOrderService $poService,
        private readonly EmployeeServiceClient $employeeClient,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user  = $request->attributes->get('auth_user');
        $query = PurchaseOrder::query()
            ->with('vendor:id,name,code')
            ->byStatus($request->query('status'))
            ->byVendor($request->query('vendor_id'))
            ->byDateRange($request->query('date_from'), $request->query('date_to'))
            ->orderByDesc('tanggal_po');

        if (in_array($user['role'], ['admin_cabang', 'staff_purchasing'])) {
            $query->byBranch((int) $user['branch_id']);
        } else {
            $query->byBranch($request->query('branch_id'));
        }

        $pos = $query->paginate($request->query('per_page', 15));

        return response()->json($pos);
    }

    public function show(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $user = $request->attributes->get('auth_user');
        $this->authorizeView($purchaseOrder, $user);

        return response()->json([
            'data' => $purchaseOrder->load('vendor', 'items.item'),
        ]);
    }

    public function store(StorePurchaseOrderRequest $request): JsonResponse
    {
        $user = $request->attributes->get('auth_user');
        $this->authorizeCreate($user);

        if (in_array($user['role'], ['admin_cabang', 'staff_purchasing'])) {
            if ((int) ($user['branch_id'] ?? 0) !== (int) $request->validated('branch_id')) {
                return response()->json(['message' => 'You can only create POs for your own branch.'], 403);
            }
        }

        try {
            $po = $this->poService->create($request->validated(), (int) $user['id']);
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        }

        return response()->json([
            'message' => 'Purchase order created.',
            'data'    => $po,
        ], 201);
    }

    public function updateItems(
        UpdatePurchaseOrderItemsRequest $request,
        PurchaseOrder $purchaseOrder,
    ): JsonResponse {
        $user = $request->attributes->get('auth_user');

        abort_if(! $purchaseOrder->isEditable(), 422, 'Items can only be edited while PO is in draft.');

        $this->authorizeBranchAction($purchaseOrder, $user);

        try {
            $po = $this->poService->updateItems($purchaseOrder, $request->validated('items'));
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        }

        return response()->json([
            'message' => 'Items updated.',
            'data'    => $po,
        ]);
    }

    public function submit(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $user = $request->attributes->get('auth_user');
        $this->authorizeBranchAction($purchaseOrder, $user);

        try {
            $po = $this->poService->submit($purchaseOrder);
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        }

        return response()->json(['message' => 'PO submitted for approval.', 'data' => $po]);
    }

    public function approve(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $user = $request->attributes->get('auth_user');
        $this->authorizeApprove($user);

        try {
            $po = $this->poService->approve($purchaseOrder, (int) $user['id']);
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        }

        return response()->json(['message' => 'PO approved.', 'data' => $po]);
    }

    public function reject(
        RejectPurchaseOrderRequest $request,
        PurchaseOrder $purchaseOrder,
    ): JsonResponse {
        $user = $request->attributes->get('auth_user');
        $this->authorizeApprove($user);

        try {
            $po = $this->poService->reject(
                $purchaseOrder,
                $request->validated('rejection_reason'),
                (int) $user['id']
            );
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        }

        return response()->json(['message' => 'PO rejected.', 'data' => $po]);
    }

    public function receive(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $user = $request->attributes->get('auth_user');
        $this->authorizeBranchAction($purchaseOrder, $user);

        try {
            $po = $this->poService->receive(
                $purchaseOrder,
                $request->input('tanggal_pengiriman')
            );
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        }

        return response()->json(['message' => 'PO marked as received. Item prices updated.', 'data' => $po]);
    }

    public function cancel(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $user = $request->attributes->get('auth_user');

        if (! in_array($user['role'], ['admin_purchasing', 'superadmin'])) {
            $this->authorizeBranchAction($purchaseOrder, $user);
        }

        try {
            $po = $this->poService->cancel($purchaseOrder);
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        }

        return response()->json(['message' => 'PO cancelled.', 'data' => $po]);
    }

    public function branches(Request $request): JsonResponse
    {
        $token = $request->bearerToken();

        try {
            $branches = $this->employeeClient->getActiveBranches($token);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }

        return response()->json(['data' => $branches]);
    }

    private function authorizeCreate(array $user): void
    {
        abort_unless(
            in_array($user['role'] ?? '', [
                'staff_purchasing',
                'admin_cabang',
                'admin_purchasing',
                'superadmin',
            ], true),
            403,
            'Forbidden.'
        );
    }

    private function authorizeApprove(array $user): void
    {
        abort_unless(
            in_array($user['role'] ?? '', ['admin_purchasing', 'superadmin'], true),
            403,
            'Forbidden.'
        );
    }

    private function authorizeView(PurchaseOrder $po, array $user): void
    {
        $role = $user['role'] ?? '';

        if (in_array($role, ['superadmin', 'admin_purchasing'])) {
            return;
        }

        if (in_array($role, ['admin_cabang', 'staff_purchasing'])) {
            abort_if(
                (int) ($user['branch_id'] ?? 0) !== (int) $po->branch_id,
                403,
                'Forbidden.'
            );

            return;
        }

        abort_if((int) $user['id'] !== (int) $po->requested_by, 403, 'Forbidden.');
    }

    private function authorizeBranchAction(PurchaseOrder $po, array $user): void
    {
        $role = $user['role'] ?? '';

        if (in_array($role, ['superadmin', 'admin_purchasing'])) {
            return;
        }

        abort_if(
            (int) ($user['branch_id'] ?? 0) !== (int) $po->branch_id,
            403,
            'You can only manage POs for your own branch.'
        );
    }
}
