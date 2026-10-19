import React from 'react';
import { 
    flexRender, 
    createCoreRowModel, 
    useTable, rowSortingFeature, rowPaginationFeature, columnVisibilityFeature, coreFeatures, 
    ColumnDef,
    OnChangeFn,
    SortingState,
    PaginationState,
    createSortedRowModel,
    createPaginatedRowModel
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    isLoading?: boolean;
    error?: Error | null;
    onRetry?: () => void;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: React.ReactNode;
    
    // Controlled state
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    pagination?: PaginationState;
    onPaginationChange?: OnChangeFn<PaginationState>;
    pageCount?: number;
    
    // Optional client-side state
    enableClientSidePagination?: boolean;
    enableClientSideSorting?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading,
    error,
    onRetry,
    emptyTitle = "Tidak ada data",
    emptyDescription,
    emptyAction,
    sorting,
    onSortingChange,
    pagination,
    onPaginationChange,
    pageCount,
    enableClientSidePagination = false,
    enableClientSideSorting = false,
}: DataTableProps<TData, TValue>) {
    
    const table = useTable({
        data,
        columns,
        getCoreRowModel: createCoreRowModel(),
        // Sorting
        state: {
            ...(sorting !== undefined && { sorting }),
            ...(pagination !== undefined && { pagination }),
        },
        onSortingChange,
        onPaginationChange,
        pageCount,
        manualPagination: !enableClientSidePagination, features: { ...coreFeatures, rowSortingFeature, rowPaginationFeature, columnVisibilityFeature },
        manualSorting: !enableClientSideSorting,
        ...(enableClientSideSorting && { getSortedRowModel: createSortedRowModel() }),
        ...(enableClientSidePagination && { getPaginationRowModel: createPaginatedRowModel() }),
    });

    if (error) {
        return (
            <div className="p-8 text-center border border-danger/20 rounded-md bg-danger/5">
                <p className="text-danger font-bold mb-4">Gagal memuat data</p>
                {onRetry && (
                    <Button variant="danger" onPress={onRetry}>Coba Lagi</Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="w-full overflow-x-auto border border-line-subtle rounded-md bg-sunken shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase text-fg bg-raised border-b border-line-subtle">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const canSort = (header.column.getCanSort?.() ?? false);
                                    return (
                                        <th key={header.id} className="px-4 py-3 whitespace-nowrap font-bold">
                                            {header.isPlaceholder ? null : (
                                                <div 
                                                    className={cn(
                                                        'flex items-center gap-2',
                                                        canSort && 'cursor-pointer select-none hover:text-fg-strong transition-colors'
                                                    )}
                                                    onClick={(header.column.getToggleSortingHandler?.() ?? undefined)}
                                                >
                                                    {flexRender(header.column.columnDef.header, (header.getContext?.() ?? {} as any))}
                                                    {canSort && (
                                                        <span className="shrink-0">
                                                            {{
                                                                asc: <ArrowUp className="size-3" />,
                                                                desc: <ArrowDown className="size-3" />,
                                                            }[(header.column.getIsSorted?.() ?? false) as string] ?? (
                                                                <ArrowUpDown className="size-3 text-fg-muted/50" />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-line-subtle bg-canvas">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-4 py-4">
                                            <div className="h-4 bg-line-subtle rounded w-3/4"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr 
                                    key={row.id}
                                    className="hover:bg-overlay transition-colors"
                                >
                                    {((row as any).getVisibleCells?.() ?? (row as any).getAllCells?.() ?? []).map((cell: any) => (
                                        <td key={cell.id} className="px-4 py-3 text-fg-strong">
                                            {flexRender(cell.column.columnDef.cell, (cell.getContext?.() ?? {} as any))}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8">
                                    <EmptyState 
                                        title={emptyTitle} 
                                        description={emptyDescription} 
                                        action={emptyAction} 
                                        className="border-0 bg-transparent"
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
            {(table.getPageCount?.() ?? 0) > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-fg-muted">
                        Halaman <span className="font-bold text-fg-strong">{(table.state?.pagination?.pageIndex ?? 0) + 1}</span> dari <span className="font-bold text-fg-strong">{(table.getPageCount?.() ?? 0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            className="px-2"
                            isDisabled={!(table.getCanPreviousPage?.() ?? false) || isLoading}
                            onPress={() => table.previousPage?.()}
                        >
                            <ChevronLeft className="size-4" />
                            <span className="sr-only">Sebelumnya</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="px-2"
                            isDisabled={!(table.getCanNextPage?.() ?? false) || isLoading}
                            onPress={() => table.nextPage?.()}
                        >
                            <ChevronRight className="size-4" />
                            <span className="sr-only">Berikutnya</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
