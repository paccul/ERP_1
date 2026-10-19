<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Slip Gaji {{ $payslip->full_name }} - {{ $payslip->period }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; line-height: 1.4; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .title { font-size: 18px; font-weight: bold; text-transform: uppercase; }
        .info { margin-bottom: 20px; display: table; width: 100%; }
        .info-left, .info-right { display: table-cell; width: 50%; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { padding: 5px; }
        .table .right { text-align: right; }
        .section-title { font-weight: bold; background: #f0f0f0; padding: 5px; border: 1px solid #ccc; }
        .border-bottom { border-bottom: 1px solid #ccc; }
        .grand-total { font-size: 14px; font-weight: bold; border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 10px 0; }
        .text-center { text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">SLIP GAJI KARYAWAN</div>
        <div>PT Garda Global Semesta</div>
    </div>
    
    <div class="info">
        <div class="info-left">
            <table width="100%">
                <tr><td width="100"><strong>Nama</strong></td><td>: {{ $payslip->full_name }}</td></tr>
                <tr><td><strong>NIK</strong></td><td>: {{ $payslip->nik }}</td></tr>
                <tr><td><strong>Lokasi Jaga</strong></td><td>: {{ $payslip->site_name }}</td></tr>
            </table>
        </div>
        <div class="info-right">
            <table width="100%">
                <tr><td width="100"><strong>Periode</strong></td><td>: {{ $payslip->period }}</td></tr>
                <tr><td><strong>Tanggal Cetak</strong></td><td>: {{ now()->format('d/m/Y') }}</td></tr>
            </table>
        </div>
    </div>
    
    <table class="table">
        <!-- PENERIMAAN -->
        <tr>
            <td colspan="2" class="section-title">PENERIMAAN</td>
        </tr>
        <tr>
            <td>Gaji Pokok</td>
            <td class="right">Rp {{ number_format($payslip->base_salary, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Tunjangan Jabatan</td>
            <td class="right">Rp {{ number_format($payslip->allowance, 2, ',', '.') }}</td>
        </tr>
        <tr class="border-bottom">
            <td>Lembur / Overtime</td>
            <td class="right">Rp {{ number_format($payslip->overtime, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td><strong>Total Penerimaan (A)</strong></td>
            <td class="right"><strong>Rp {{ number_format($payslip->base_salary + $payslip->allowance + $payslip->overtime, 2, ',', '.') }}</strong></td>
        </tr>
        
        <tr><td colspan="2">&nbsp;</td></tr>
        
        <!-- POTONGAN -->
        <tr>
            <td colspan="2" class="section-title">POTONGAN</td>
        </tr>
        <tr>
            <td>BPJS Kesehatan (1%)</td>
            <td class="right">Rp {{ number_format($payslip->bpjs_kes, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td>BPJS Ketenagakerjaan (2%)</td>
            <td class="right">Rp {{ number_format($payslip->bpjs_tk, 2, ',', '.') }}</td>
        </tr>
        <tr class="border-bottom">
            <td>PPh 21</td>
            <td class="right">Rp {{ number_format($payslip->pph21, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td><strong>Total Potongan (B)</strong></td>
            <td class="right"><strong>Rp {{ number_format($payslip->bpjs_kes + $payslip->bpjs_tk + $payslip->pph21, 2, ',', '.') }}</strong></td>
        </tr>
    </table>
    
    <div class="grand-total">
        <table width="100%">
            <tr>
                <td><strong>GAJI BERSIH (A - B)</strong></td>
                <td class="right"><strong>Rp {{ number_format($payslip->net_pay, 2, ',', '.') }}</strong></td>
            </tr>
        </table>
    </div>
    
    <div style="margin-top: 50px;">
        <table width="100%" class="text-center">
            <tr>
                <td width="50%">
                    <p>Mengetahui,</p>
                    <br><br><br>
                    <p><strong>HRD Manager</strong></p>
                </td>
                <td width="50%">
                    <p>Penerima,</p>
                    <br><br><br>
                    <p><strong>{{ $payslip->full_name }}</strong></p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
