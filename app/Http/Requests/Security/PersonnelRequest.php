<?php

namespace App\Http\Requests\Security;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PersonnelRequest extends FormRequest
{
    public function authorize(): bool
        {
            return $this->user()?->can('security.manage') ?? false;
        }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'nik' => ['required', 'string', 'max:16', Rule::unique('personnel')->ignore($id)],
            'full_name' => ['required', 'string', 'max:255'],
            'birth_place' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'kta_number' => ['nullable', 'string', 'max:255'],
            'kta_expires_at' => ['nullable', 'date'],
            'gada_level' => ['nullable', 'in:pratama,madya,utama'],
            'gada_cert_number' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'joined_at' => ['nullable', 'date'],
            'status' => ['required', 'string', 'in:active,leave,inactive'],
            'site_id' => ['nullable', 'exists:sites,id'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account' => ['nullable', 'string', 'max:255'],
            'base_salary' => ['nullable', 'numeric', 'min:0'],
            'allowance' => ['nullable', 'numeric', 'min:0'],
            'applicant_id' => ['nullable', 'exists:applicants,id'],
        ];
    }
}
