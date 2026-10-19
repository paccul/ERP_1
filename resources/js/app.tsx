import { createInertiaApp } from '@inertiajs/react';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
    constructor(props: {children: ReactNode}) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', background: '#fee', color: '#c00', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', height: '100vh', overflow: 'auto', position: 'fixed', inset: 0, zIndex: 9999 }}>
                    <h1>React Rendering Error</h1>
                    <pre style={{ fontWeight: 'bold' }}>{this.state.error?.toString()}</pre>
                    <pre>{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

type PageModule = { default: ComponentType };
const pages = import.meta.glob<PageModule>('./Pages/**/*.tsx');

createInertiaApp({
    title: (title) => (title ? title + ' - Garda ERP' : 'Garda ERP'),
    resolve: async (name) => {
        const loadPage = pages['./Pages/' + name + '.tsx'];
        if (!loadPage) {
            throw new Error('Halaman Inertia tidak ditemukan: ' + name);
        }
        const pageModule = await loadPage();
        return pageModule.default;
    },
    setup({ el, App, props }) {
        if (!el) {
            throw new Error('Elemen root Inertia tidak ditemukan.');
        }
        createRoot(el).render(<ErrorBoundary><App {...props} /></ErrorBoundary>);
    },
});
