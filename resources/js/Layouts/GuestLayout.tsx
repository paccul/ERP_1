import { PropsWithChildren } from 'react';
import { Head } from '@inertiajs/react';

export default function Guest({ children, title }: PropsWithChildren<{ title?: string }>) {
    return (
        <div className="min-h-screen bg-canvas text-fg flex flex-col sm:justify-center items-center pt-6 sm:pt-0">
            {title && <Head title={title} />}
            <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-raised shadow-md overflow-hidden sm:rounded-md border border-line-subtle">
                {children}
            </div>
        </div>
    );
}
