<?php

namespace App\Http\Requests\Security;

use Illuminate\Foundation\Http\FormRequest;

class LocationRequest extends FormRequest
{
    public function authorize(): bool
        {
            return $this->user()?->can('security.manage') ?? false;
        }

    public function rules(): array
    {
        return [
            'client_id' => ['nullable', 'exists:clients,id'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'guards_per_shift' => ['nullable', 'integer', 'min:1'],
            'monthly_rate_per_guard' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
