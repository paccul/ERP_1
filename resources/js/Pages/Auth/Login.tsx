import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { TextField } from '@/Components/ui/TextField';
import { Button } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Checkbox';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout title="Log in">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-fg-strong">Garda ERP</h1>
                <p className="text-sm text-fg-muted mt-2">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <TextField
                    label="Alamat Email"
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={v => setData('email', v)}
                    errorMessage={errors.email}
                    isInvalid={!!errors.email}
                    autoComplete="username"
                    autoFocus
                />

                <TextField
                    label="Kata Sandi"
                    type="password"
                    name="password"
                    value={data.password}
                    onChange={v => setData('password', v)}
                    errorMessage={errors.password}
                    isInvalid={!!errors.password}
                    autoComplete="current-password"
                />

                <div className="flex items-center justify-between mt-4">
                    <Checkbox
                        name="remember"
                        isSelected={data.remember}
                        onChange={v => setData('remember', v)}
                    >
                        Ingat saya
                    </Checkbox>
                </div>

                <div className="pt-2">
                    <Button type="submit" className="w-full" isPending={processing}>
                        Masuk
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
