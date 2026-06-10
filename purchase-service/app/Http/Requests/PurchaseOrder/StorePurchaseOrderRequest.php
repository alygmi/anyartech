<?php

namespace App\Http\Requests\PurchaseOrder;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'branch_id'            => 'required|integer',
            'vendor_id'            => 'required|exists:vendors,id',
            'tanggal_dibutuhkan'   => 'nullable|date|after_or_equal:today',
            'catatan'              => 'nullable|string',

            'items'                => 'nullable|array',
            'items.*.item_id'      => 'required|exists:items,id',
            'items.*.quantity'     => 'required|numeric|min:0.01',
            'items.*.unit_price'   => 'required|numeric|min:0',
            'items.*.notes'        => 'nullable|string',
        ];
    }
}
