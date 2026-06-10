<?php

namespace App\Http\Requests\Item;

use App\Models\Item;
use Illuminate\Foundation\Http\FormRequest;

class UpdateItemRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $item = $this->route('item');
        $id   = $item instanceof Item ? $item->getKey() : $item;

        return [
            'code'              => "sometimes|string|max:50|unique:items,code,{$id}",
            'name'              => 'sometimes|string|max:200',
            'description'       => 'nullable|string',
            'category'          => 'sometimes|string|max:100',
            'unit'              => 'sometimes|string|max:30',
            'default_vendor_id' => 'nullable|exists:vendors,id',
            'is_active'         => 'sometimes|boolean',
        ];
    }
}
