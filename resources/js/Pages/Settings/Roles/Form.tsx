import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/Components/ui/Card';
import { TextField } from '@/Components/ui/TextField';
import { Button } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Checkbox';
import { ArrowLeft } from 'lucide-react';

interface PermissionGroup {
    module: string;
    permissions: {
        id: number;
        name: string;
        action: string;
    }[];
}

interface Props {
    role: {
        id: number;
        name: string;
        description: string | null;
        permissions: string[];
    } | null;
    permissionGroups: PermissionGroup[];
}

export default function Form({ role, permissionGroups }: Props) {
    const isEditing = !!role;
    const isSuperadmin = role?.name === 'superadmin';
    
    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name || '',
        description: role?.description || '',
        permissions: role?.permissions || [] as string[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('settings.roles.update', role.id));
        } else {
            post(route('settings.roles.store'));
        }
    };

    const handlePermissionToggle = (permissionName: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData('permissions', data.permissions.filter(p => p !== permissionName));
        }
    };

    const handleModuleToggle = (group: PermissionGroup, checked: boolean) => {
        const groupPerms = group.permissions.map(p => p.name);
        if (checked) {
            // Add all that are not already present
            setData('permissions', Array.from(new Set([...data.permissions, ...groupPerms])));
        } else {
            // Remove all
            setData('permissions', data.permissions.filter(p => !groupPerms.includes(p)));
        }
    };

    return (
        <AppLayout title={isEditing ? 'Edit Role' : 'Tambah Role'}>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="px-2" asChild>
                        <Link href={route('settings.roles.index')}><ArrowLeft className="size-5" /></Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-fg-strong">{isEditing ? 'Edit Role' : 'Tambah Role Baru'}</h2>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-bold text-fg-strong mb-4 border-b border-line-subtle pb-2">Informasi Role</h3>
                            </div>
                            
                            <TextField
                                label="Nama Role"
                                value={data.name}
                                onChange={v => setData('name', v)}
                                errorMessage={errors.name}
                                isInvalid={!!errors.name}
                                isDisabled={isSuperadmin}
                                description={isSuperadmin ? "Nama role superadmin tidak dapat diubah." : "Gunakan huruf kecil tanpa spasi (misal: manager_hrd)."}
                            />
                            
                            <div className="md:col-span-2">
                                <TextField
                                    label="Deskripsi"
                                    value={data.description}
                                    onChange={v => setData('description', v)}
                                    errorMessage={errors.description}
                                    isInvalid={!!errors.description}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-lg font-bold text-fg-strong mb-4 border-b border-line-subtle pb-2 mt-4">Hak Akses Modul</h3>
                                {errors.permissions && <p className="text-sm text-danger mb-4">{errors.permissions}</p>}
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {permissionGroups.map(group => {
                                        const groupPerms = group.permissions.map(p => p.name);
                                        const allChecked = groupPerms.every(p => data.permissions.includes(p));
                                        const someChecked = groupPerms.some(p => data.permissions.includes(p));
                                        const isIndeterminate = someChecked && !allChecked;
                                        
                                        return (
                                            <div key={group.module} className="border border-line-subtle rounded-md overflow-hidden">
                                                <div className="bg-sunken px-4 py-3 border-b border-line-subtle flex items-center justify-between">
                                                    <span className="font-bold text-fg-strong capitalize">{group.module.replace('_', ' ')}</span>
                                                    <Checkbox 
                                                        isSelected={allChecked}
                                                        isIndeterminate={isIndeterminate}
                                                        onChange={checked => handleModuleToggle(group, checked)}
                                                        isDisabled={isSuperadmin}
                                                    >
                                                        Pilih Semua
                                                    </Checkbox>
                                                </div>
                                                <div className="p-4 grid grid-cols-2 gap-3 bg-canvas">
                                                    {group.permissions.map(perm => (
                                                        <Checkbox
                                                            key={perm.id}
                                                            isSelected={data.permissions.includes(perm.name)}
                                                            onChange={checked => handlePermissionToggle(perm.name, checked)}
                                                            isDisabled={isSuperadmin}
                                                        >
                                                            <span className="capitalize">{perm.action}</span>
                                                        </Checkbox>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-line-subtle">
                            <Button variant="ghost" asChild>
                                <Link href={route('settings.roles.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" isPending={processing}>
                                Simpan Role
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
