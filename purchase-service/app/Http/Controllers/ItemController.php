<?php

namespace App\Http\Controllers;

use App\Http\Requests\Item\StoreItemRequest;
use App\Http\Requests\Item\UpdateItemRequest;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Item::query()
            ->with('defaultVendor:id,name,code')
            ->search($request->query('search'))
            ->byCategory($request->query('category'))
            ->when(
                $request->has('is_active'),
                fn ($q) => $q->where('is_active', (int) $request->query('is_active'))
            )
            ->orderBy('name');

        $items = $query->paginate($request->query('per_page', 15));

        return response()->json($items);
    }

    public function store(StoreItemRequest $request): JsonResponse
    {
        $this->authorizeManage($request->attributes->get('auth_user'));

        $item = Item::create($request->validated());

        return response()->json([
            'message' => 'Item created.',
            'data'    => $item->load('defaultVendor:id,name,code'),
        ], 201);
    }

    public function show(Item $item): JsonResponse
    {
        return response()->json([
            'data' => $item->load('defaultVendor:id,name,code'),
        ]);
    }

    public function update(UpdateItemRequest $request, Item $item): JsonResponse
    {
        $this->authorizeManage($request->attributes->get('auth_user'));

        $item->update($request->validated());

        return response()->json([
            'message' => 'Item updated.',
            'data'    => $item->fresh()->load('defaultVendor:id,name,code'),
        ]);
    }

    public function destroy(Request $request, Item $item): JsonResponse
    {
        $this->authorizeManage($request->attributes->get('auth_user'));

        $item->update(['is_active' => 0]);

        return response()->json(['message' => 'Item deactivated.']);
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
