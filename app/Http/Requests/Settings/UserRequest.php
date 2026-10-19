<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('users.manage');
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', 'exists:roles,name'],
            'is_active' => ['boolean'],
        ];

        if ($this->isMethod('POST')) {
            $rules['password'] = ['required', 'string', 'min:8'];
        } else {
            $rules['password'] = ['nullable', 'string', 'min:8'];
        }

        return $rules;
    }
}
