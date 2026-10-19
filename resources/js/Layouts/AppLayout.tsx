import { useState, PropsWithChildren } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Menu, X, LayoutDashboard, Shield, Users, Package, DollarSign, BookOpen, BarChart3, Settings, LogOut } from 'lucide-react';
import { Dialog, Modal, DialogTrigger, Button as AriaButton } from 'react-aria-components';

type MenuItem = {
    name: string;
    href: string;
    icon: React.ElementType;
    permission: string;
    activeRegex: RegExp;
};

const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'dashboard.view', activeRegex: /^\/dashboard/ },
    { name: 'Operasional', href: '/security/personnels', icon: Shield, permission: 'security.view', activeRegex: /^\/security/ },
    { name: 'Rekrutmen', href: '/psb/applicants', icon: Users, permission: 'recruitment.view', activeRegex: /^\/psb/ },
    { name: 'Logistik', href: '/logistics/items', icon: Package, permission: 'logistics.view', activeRegex: /^\/logistics/ },
    { name: 'Keuangan', href: '/finance/invoices', icon: DollarSign, permission: 'finance.view', activeRegex: /^\/finance/ },
    { name: 'Akuntansi', href: '/accounting/accounts', icon: BookOpen, permission: 'accounting.view', activeRegex: /^\/accounting/ },
    { name: 'Laporan', href: '/reports/ledger', icon: BarChart3, permission: 'reports.view', activeRegex: /^\/reports/ },
    { name: 'Pengaturan', href: '/settings/institution', icon: Settings, permission: 'institution.view', activeRegex: /^\/settings/ },
];

export default function AppLayout({ children, title }: PropsWithChildren<{ title?: string }>) {
    const { url, props } = usePage();
    const user = props.auth?.user as { name: string; email: string; permissions?: string[] };
    const [isOpen, setIsOpen] = useState(false);

    // Filter menu based on permissions. 
    // In a real app, user.permissions would contain the assigned permissions.
    // Dashboard is always visible if logged in.
    const hasPermission = (permission: string) => {
        if (permission === 'dashboard.view') return true;
        // Temporary logic for development until RBAC is fully passed via Inertia props
        return user?.permissions ? user.permissions.includes(permission) : true;
    };

    const filteredMenu = menuItems.filter(item => hasPermission(item.permission));

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-sunken border-r border-line-subtle w-64 text-fg">
            <div className="p-4 border-b border-line-subtle flex items-center justify-between">
                <span className="text-xl font-bold text-fg-strong">Garda ERP</span>
                <div className="lg:hidden">
                    <AriaButton onPress={() => setIsOpen(false)} className="p-2 hover:bg-overlay rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        <X className="size-5" />
                    </AriaButton>
                </div>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
                {filteredMenu.map((item) => {
                    const isActive = item.activeRegex.test(url);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors ${
                                isActive ? 'bg-overlay text-accent font-bold' : 'hover:bg-overlay hover:text-fg-strong'
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                            onClick={() => setIsOpen(false)}
                        >
                            <Icon className="size-5" />
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-line-subtle">
                <div className="flex items-center justify-between">
                    <div className="truncate">
                        <p className="text-sm font-bold text-fg-strong truncate">{user?.name}</p>
                        <p className="text-xs text-fg-muted truncate">{user?.email}</p>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="p-2 text-fg-muted hover:text-danger rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
                        title="Logout"
                    >
                        <LogOut className="size-5" />
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-canvas text-fg font-sans flex">
            {title && <Head title={title} />}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block h-screen sticky top-0">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer */}
            <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
                <AriaButton className="lg:hidden fixed bottom-4 right-4 z-50 bg-accent text-fg-on-accent p-3 rounded-full shadow-accent outline-none focus-visible:ring-2 focus-visible:ring-fg-strong">
                    <Menu className="size-6" />
                </AriaButton>
                <Modal 
                    isDismissable
                    className="fixed inset-0 z-50 flex"
                    overlayClassName="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-40"
                >
                    <Dialog className="outline-none h-full shadow-overlay">
                        <SidebarContent />
                    </Dialog>
                </Modal>
            </DialogTrigger>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="lg:hidden h-16 border-b border-line-subtle bg-sunken flex items-center px-4 sticky top-0 z-30">
                    <span className="text-lg font-bold text-fg-strong">Garda ERP</span>
                </header>
                <div className="p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    {(props.flash as any)?.error && (
                        <div className="mb-4 p-4 rounded-md border border-danger/40 bg-danger/10 text-danger text-sm font-bold">
                            {(props.flash as any).error}
                        </div>
                    )}
                    {(props.flash as any)?.success && (
                        <div className="mb-4 p-4 rounded-md border border-success/40 bg-success/10 text-success text-sm font-bold">
                            {(props.flash as any).success}
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
