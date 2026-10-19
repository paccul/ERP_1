<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInstitutionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('institution.manage');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:255'],
            'npwp' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'vat_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'bpjs_kes_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'bpjs_tk_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'overtime_hourly_rate' => ['required', 'numeric', 'min:0'],
        ];
    }
}
