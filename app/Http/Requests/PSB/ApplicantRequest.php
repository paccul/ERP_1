<?php

namespace App\Http\Requests\PSB;

use Illuminate\Foundation\Http\FormRequest;

class ApplicantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('recruitment.manage');
    }

    public function rules(): array
    {
        return [
            'nik' => ['required', 'string', 'max:16'],
            'full_name' => ['required', 'string', 'max:255'],
            'birth_place' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['required', 'in:L,P'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'ktp_number' => ['nullable', 'string', 'max:50'],
            'kk_number' => ['nullable', 'string', 'max:50'],
            'height_cm' => ['nullable', 'numeric'],
            'weight_kg' => ['nullable', 'numeric'],
            'education' => ['nullable', 'string', 'max:50'],
            'has_experience' => ['boolean'],
            'experience_desc' => ['nullable', 'string'],
        ];
    }
}
