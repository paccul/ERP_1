export function formatCurrency(amount: number | string): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(value)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(d);
}
