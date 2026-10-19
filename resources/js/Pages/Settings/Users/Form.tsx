import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/Components/ui/Card';
import { TextField } from '@/Components/ui/TextField';
import { Button } from '@/Components/ui/Button';
import { Select, SelectItem } from '@/Components/ui/Select';
import { Switch } from '@/Components/ui/Switch';
import { ArrowLeft } from 'lucide-react';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        is_active: boolean;
        roles: string[];
    } | null;
    roles: string[];
}

export default function Form({ user, roles }: Props) {
    const isEditing = !!user;
    
    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        roles: user?.roles || [] as string[],
        is_active: user ? user.is_active : true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('settings.users.update', user.id));
        } else {
            post(route('settings.users.store'));
        }
    };

    return (
        <AppLayout title={isEditing ? 'Edit Pengguna' : 'Tambah Pengguna'}>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="px-2" asChild>
                        <Link href={route('settings.users.index')}><ArrowLeft className="size-5" /></Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">{isEditing ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-bold text-fg-strong mb-4 border-b border-line-subtle pb-2">Informasi Akun</h3>
                            </div>
                            
                            <TextField
                                label="Nama Lengkap"
                                value={data.name}
                                onChange={v => setData('name', v)}
                                errorMessage={errors.name}
                                isInvalid={!!errors.name}
                            />
                            <TextField
                                label="Alamat Email"
                                type="email"
                                value={data.email}
                                onChange={v => setData('email', v)}
                                errorMessage={errors.email}
                                isInvalid={!!errors.email}
                            />
                            
                            {/* Wait, the Select primitive is meant for single selection in Aria. 
                                For roles, which is an array, we might need a multi-select or multiple checkboxes. 
                                Since it's a simple app, let's just use native select with multiple or a list of checkboxes.
                            */}
                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-fg mb-1 block">Peran (Role)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-line-input rounded-sm bg-sunken">
                                    {roles.map(role => (
                                        <label key={role} className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-line-input bg-canvas text-accent focus:ring-accent"
                                                checked={data.roles.includes(role)}
                                                onChange={(e) => {
                                                    const newRoles = e.target.checked 
                                                        ? [...data.roles, role]
                                                        : data.roles.filter(r => r !== role);
                                                    setData('roles', newRoles);
                                                }}
                                            />
                                            <span className="text-sm text-fg-strong">{role}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.roles && <p className="text-xs text-danger mt-1">{errors.roles}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-lg font-bold text-fg-strong mb-4 border-b border-line-subtle pb-2 mt-4">Keamanan & Status</h3>
                            </div>

                            <TextField
                                label={isEditing ? "Kata Sandi Baru (Opsional)" : "Kata Sandi"}
                                type="password"
                                value={data.password}
                                onChange={v => setData('password', v)}
                                errorMessage={errors.password}
                                isInvalid={!!errors.password}
                                description={isEditing ? "Biarkan kosong jika tidak ingin mengubah kata sandi." : "Minimal 8 karakter."}
                            />
                            
                            <div className="flex items-center h-full pt-6">
                                <Switch
                                    isSelected={data.is_active}
                                    onChange={v => setData('is_active', v)}
                                    description={data.is_active ? "Akun aktif dan dapat login." : "Akun dinonaktifkan."}
                                >
                                    Status Akun Aktif
                                </Switch>
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-line-subtle">
                            <Button variant="ghost" asChild>
                                <Link href={route('settings.users.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" isPending={processing}>
                                Simpan Pengguna
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
