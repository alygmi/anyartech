<?php

namespace App\Http\Requests\Item;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'code'              => 'required|string|max:50|unique:items,code',
            'name'              => 'required|string|max:200',
            'description'       => 'nullable|string',
            'category'          => 'required|string|max:100',
            'unit'              => 'required|string|max:30',
            'default_vendor_id' => 'nullable|exists:vendors,id',
        ];
    }
}
