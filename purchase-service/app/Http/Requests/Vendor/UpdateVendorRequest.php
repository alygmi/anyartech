<?php

namespace App\Http\Requests\Vendor;

use App\Models\Vendor;
use Illuminate\Foundation\Http\FormRequest;

class UpdateVendorRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $vendor = $this->route('vendor');
        $id     = $vendor instanceof Vendor ? $vendor->getKey() : $vendor;

        return [
            'name'               => 'sometimes|string|max:150',
            'code'               => "sometimes|string|max:30|unique:vendors,code,{$id}",
            'contact_person'     => 'sometimes|string|max:100',
            'phone'              => 'sometimes|string|max:30',
            'email'              => 'nullable|email|max:150',
            'address'            => 'sometimes|string',
            'npwp'               => 'nullable|string|max:30',
            'payment_term_days'  => 'sometimes|integer|min:1',
            'is_active'          => 'sometimes|boolean',
        ];
    }
}
