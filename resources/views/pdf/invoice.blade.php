<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $invoice->number }}</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; line-height: 1.4; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
        .info { margin-bottom: 30px; display: table; width: 100%; }
        .info-left, .info-right { display: table-cell; width: 50%; }
        .info-right { text-align: right; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .table th, .table td { border: 1px solid #ccc; padding: 10px; }
        .table th { background-color: #f5f5f5; text-align: left; }
        .table .right { text-align: right; }
        .totals { width: 50%; float: right; border-collapse: collapse; }
        .totals th, .totals td { padding: 5px 10px; border: none; }
        .totals th { text-align: right; }
        .totals .right { text-align: right; }
        .totals .grand { font-weight: bold; font-size: 16px; border-top: 2px solid #333; }
        .clearfix::after { content: ""; clear: both; display: table; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">INVOICE (TAGIHAN JASA PENGAMANAN)</div>
        <div>PT Garda Global Semesta</div>
    </div>
    
    <div class="info">
        <div class="info-left">
            <strong>Kepada:</strong><br>
            {{ $invoice->client_name }}<br>
            {{ $invoice->client_address }}
        </div>
        <div class="info-right">
            <strong>No. Invoice:</strong> {{ $invoice->number }}<br>
            <strong>Tanggal:</strong> {{ $invoice->issued_at ? \Carbon\Carbon::parse($invoice->issued_at)->format('d F Y') : 'DRAFT' }}<br>
            <strong>Jatuh Tempo:</strong> {{ $invoice->due_at ? \Carbon\Carbon::parse($invoice->due_at)->format('d F Y') : '-' }}<br>
            <strong>Periode:</strong> {{ $invoice->period }}
        </div>
    </div>
    
    <table class="table">
        <thead>
            <tr>
                <th>No</th>
                <th>Deskripsi Pekerjaan</th>
                <th class="right">Jml Personil</th>
                <th class="right">Tarif (Rp)</th>
                <th class="right">Jumlah (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($lines as $idx => $line)
            <tr>
                <td>{{ $idx + 1 }}</td>
                <td>{{ $line->description }}</td>
                <td class="right">{{ $line->guards }}</td>
                <td class="right">{{ number_format($line->rate, 2, ',', '.') }}</td>
                <td class="right">{{ number_format($line->amount, 2, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <div class="clearfix">
        <table class="totals">
            <tr>
                <th>Subtotal:</th>
                <td class="right">{{ number_format($invoice->subtotal, 2, ',', '.') }}</td>
            </tr>
            <tr>
                <th>PPN ({{ $invoice->vat_rate }}%):</th>
                <td class="right">{{ number_format($invoice->vat_amount, 2, ',', '.') }}</td>
            </tr>
            <tr class="grand">
                <th>Total Tagihan:</th>
                <td class="right">{{ number_format($invoice->total, 2, ',', '.') }}</td>
            </tr>
        </table>
    </div>
    
    <div style="margin-top: 50px;">
        <p>Mohon transfer pembayaran ke rekening berikut:</p>
        <strong>Bank Mandiri</strong><br>
        A.N: PT Garda Global Semesta<br>
        No. Rek: 123-456-789-0
    </div>
</body>
</html>
