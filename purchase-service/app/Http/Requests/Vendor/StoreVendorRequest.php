<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;

class StoreVendorRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'               => 'required|string|max:150',
            'code'               => 'required|string|max:30|unique:vendors,code',
            'contact_person'     => 'required|string|max:100',
            'phone'              => 'required|string|max:30',
            'email'              => 'nullable|email|max:150',
            'address'            => 'required|string',
            'npwp'               => 'nullable|string|max:30',
            'payment_term_days'  => 'required|integer|min:1',
        ];
    }
}
