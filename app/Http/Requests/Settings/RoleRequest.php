<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('roles.manage');
    }

    public function rules(): array
    {
        $roleId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('roles')->ignore($roleId)],
            'description' => ['nullable', 'string'],
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }
}
