<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('/login', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'store']);
});

Route::post('/logout', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        $pgsql = true;
    } catch (\Exception $e) {
        $pgsql = false;
    }
    
    try {
        \Illuminate\Support\Facades\Redis::connection()->ping();
        $redis = true;
    } catch (\Exception $e) {
        $redis = false;
    }
    
    $status = ($pgsql && $redis) ? 'ok' : 'error';
    
    return response()->json([
        'status' => $status,
        'pgsql' => $pgsql,
        'redis' => $redis,
    ], $status === 'ok' ? 200 : 503);
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, '__invoke'])->name('dashboard');
    
    Route::prefix('settings')->name('settings.')->group(function () {
        // Institution Settings
        Route::get('/institution', [\App\Http\Controllers\Settings\InstitutionController::class, 'edit'])
            ->name('institution.edit')
            ->middleware('permission:institution.view');
        Route::get('/institution/visual', [\App\Http\Controllers\Settings\InstitutionController::class, 'visual'])
            ->name('institution.visual')
            ->middleware('permission:institution.view');
        Route::put('/institution', [\App\Http\Controllers\Settings\InstitutionController::class, 'update'])
            ->name('institution.update')
            ->middleware('permission:institution.manage');
        // Users
        Route::get('/users', [\App\Http\Controllers\Settings\UserController::class, 'index'])
            ->name('users.index')
            ->middleware('permission:users.view');
        Route::get('/users/new', [\App\Http\Controllers\Settings\UserController::class, 'create'])
            ->name('users.create')
            ->middleware('permission:users.manage');
        Route::post('/users', [\App\Http\Controllers\Settings\UserController::class, 'store'])
            ->name('users.store')
            ->middleware('permission:users.manage');
        Route::get('/users/edit/{id}', [\App\Http\Controllers\Settings\UserController::class, 'edit'])
            ->name('users.edit')
            ->middleware('permission:users.manage');
        Route::put('/users/{id}', [\App\Http\Controllers\Settings\UserController::class, 'update'])
            ->name('users.update')
            ->middleware('permission:users.manage');
        Route::delete('/users/{id}', [\App\Http\Controllers\Settings\UserController::class, 'destroy'])
            ->name('users.destroy')
            ->middleware('permission:users.manage');
            
        // Roles & Permissions
        Route::get('/roles', [\App\Http\Controllers\Settings\RoleController::class, 'index'])
            ->name('roles.index')
            ->middleware('permission:roles.view');
        Route::get('/roles/new', [\App\Http\Controllers\Settings\RoleController::class, 'create'])
            ->name('roles.create')
            ->middleware('permission:roles.manage');
        Route::post('/roles', [\App\Http\Controllers\Settings\RoleController::class, 'store'])
            ->name('roles.store')
            ->middleware('permission:roles.manage');
        Route::get('/roles/edit/{id}', [\App\Http\Controllers\Settings\RoleController::class, 'edit'])
            ->name('roles.edit')
            ->middleware('permission:roles.manage');
        Route::put('/roles/{id}', [\App\Http\Controllers\Settings\RoleController::class, 'update'])
            ->name('roles.update')
            ->middleware('permission:roles.manage');
        Route::delete('/roles/{id}', [\App\Http\Controllers\Settings\RoleController::class, 'destroy'])
            ->name('roles.destroy')
            ->middleware('permission:roles.manage');

        // Backups
        Route::get('/backups', [\App\Http\Controllers\Settings\BackupController::class, 'index'])
            ->name('backups.index')
            ->middleware('permission:backups.view');
        Route::post('/backups', [\App\Http\Controllers\Settings\BackupController::class, 'store'])
            ->name('backups.store')
            ->middleware('permission:backups.manage');
        Route::get('/backups/download/{file_name}', [\App\Http\Controllers\Settings\BackupController::class, 'download'])
            ->name('backups.download')
            ->middleware('permission:backups.manage');
        Route::delete('/backups/{file_name}', [\App\Http\Controllers\Settings\BackupController::class, 'destroy'])
            ->name('backups.destroy')
            ->middleware('permission:backups.manage');
    });

    Route::prefix('security')->name('security.')->group(function () {
        // Personnels
        Route::get('/personnels', [\App\Http\Controllers\Security\PersonnelController::class, 'index'])
            ->name('personnels.index')
            ->middleware('permission:security.view');
        Route::get('/personnels/new', [\App\Http\Controllers\Security\PersonnelController::class, 'create'])
            ->name('personnels.create')
            ->middleware('permission:security.manage');
        Route::post('/personnels', [\App\Http\Controllers\Security\PersonnelController::class, 'store'])
            ->name('personnels.store')
            ->middleware('permission:security.manage');
        Route::get('/personnels/edit/{id}', [\App\Http\Controllers\Security\PersonnelController::class, 'edit'])
            ->name('personnels.edit')
            ->middleware('permission:security.manage');
        Route::put('/personnels/{id}', [\App\Http\Controllers\Security\PersonnelController::class, 'update'])
            ->name('personnels.update')
            ->middleware('permission:security.manage');
        Route::delete('/personnels/{id}', [\App\Http\Controllers\Security\PersonnelController::class, 'destroy'])
            ->name('personnels.destroy')
            ->middleware('permission:security.manage');

        // Locations
        Route::get('/locations', [\App\Http\Controllers\Security\LocationController::class, 'index'])
            ->name('locations.index')
            ->middleware('permission:security.view');
        Route::post('/locations', [\App\Http\Controllers\Security\LocationController::class, 'store'])
            ->name('locations.store')
            ->middleware('permission:security.manage');
        Route::put('/locations/{id}', [\App\Http\Controllers\Security\LocationController::class, 'update'])
            ->name('locations.update')
            ->middleware('permission:security.manage');
        Route::delete('/locations/{id}', [\App\Http\Controllers\Security\LocationController::class, 'destroy'])
            ->name('locations.destroy')
            ->middleware('permission:security.manage');

        // Schedules
        Route::get('/schedules', [\App\Http\Controllers\Security\ScheduleController::class, 'index'])
            ->name('schedules.index')
            ->middleware('permission:security.view');
        Route::post('/schedules', [\App\Http\Controllers\Security\ScheduleController::class, 'store'])
            ->name('schedules.store')
            ->middleware('permission:security.manage');

        // Attendances
        Route::get('/attendances', [\App\Http\Controllers\Security\AttendanceController::class, 'index'])
            ->name('attendances.index')
            ->middleware('permission:security.view');
        Route::post('/attendances/check-in', [\App\Http\Controllers\Security\AttendanceController::class, 'checkIn'])
            ->name('attendances.check-in')
            ->middleware('permission:security.view');
        Route::post('/attendances/check-out', [\App\Http\Controllers\Security\AttendanceController::class, 'checkOut'])
            ->name('attendances.check-out')
            ->middleware('permission:security.view');

        // Checkpoints
        Route::get('/checkpoints', [\App\Http\Controllers\Security\CheckpointController::class, 'index'])
            ->name('checkpoints.index')
            ->middleware('permission:security.view');
        Route::post('/checkpoints', [\App\Http\Controllers\Security\CheckpointController::class, 'store'])
            ->name('checkpoints.store')
            ->middleware('permission:security.manage');

        // BKO
        Route::get('/bko-requests', [\App\Http\Controllers\Security\BkoController::class, 'index'])
            ->name('bko.index')
            ->middleware('permission:security.view');
        Route::post('/bko-requests', [\App\Http\Controllers\Security\BkoController::class, 'store'])
            ->name('bko.store')
            ->middleware('permission:security.manage');
        Route::put('/bko-requests/{id}/approve', [\App\Http\Controllers\Security\BkoController::class, 'approve'])
            ->name('bko.approve')
            ->middleware('permission:security.manage');
            
        // Reports
        Route::get('/reports', [\App\Http\Controllers\Security\ReportController::class, 'index'])
            ->name('reports.index')
            ->middleware('permission:reports.view');
    });

    // Accounting
        Route::get('/accounting/accounts', [\App\Http\Controllers\Accounting\AccountController::class, 'index'])
            ->name('accounts.index')
            ->middleware('permission:accounting.view');
        Route::get('/accounting/accounts/create', [\App\Http\Controllers\Accounting\AccountController::class, 'create'])
            ->name('accounts.create')
            ->middleware('permission:accounting.manage');
        Route::post('/accounting/accounts', [\App\Http\Controllers\Accounting\AccountController::class, 'store'])
            ->name('accounts.store')
            ->middleware('permission:accounting.manage');
        Route::get('/accounting/accounts/{id}/edit', [\App\Http\Controllers\Accounting\AccountController::class, 'edit'])
            ->name('accounts.edit')
            ->middleware('permission:accounting.manage');
        Route::put('/accounting/accounts/{id}', [\App\Http\Controllers\Accounting\AccountController::class, 'update'])
            ->name('accounts.update')
            ->middleware('permission:accounting.manage');
        Route::delete('/accounting/accounts/{id}', [\App\Http\Controllers\Accounting\AccountController::class, 'destroy'])
            ->name('accounts.destroy')
            ->middleware('permission:accounting.manage');

        Route::get('/accounting/journals', [\App\Http\Controllers\Accounting\JournalController::class, 'index'])
            ->name('journals.index')
            ->middleware('permission:accounting.view');
        Route::get('/accounting/journals/create', [\App\Http\Controllers\Accounting\JournalController::class, 'create'])
            ->name('journals.create')
            ->middleware('permission:accounting.manage');
        Route::post('/accounting/journals', [\App\Http\Controllers\Accounting\JournalController::class, 'store'])
            ->name('journals.store')
            ->middleware('permission:accounting.manage');
        Route::get('/accounting/journals/{id}', [\App\Http\Controllers\Accounting\JournalController::class, 'show'])
            ->name('journals.show')
            ->middleware('permission:accounting.view');
        Route::post('/accounting/journals/{id}/post', [\App\Http\Controllers\Accounting\JournalController::class, 'post'])
            ->name('journals.post')
            ->middleware('permission:accounting.manage');
        Route::post('/accounting/journals/{id}/reverse', [\App\Http\Controllers\Accounting\JournalController::class, 'reverse'])
            ->name('journals.reverse')
            ->middleware('permission:accounting.manage');

    // Logistics
        Route::get('/logistics/items', [\App\Http\Controllers\Logistics\ItemController::class, 'index'])
            ->name('logistics.items.index')
            ->middleware('permission:logistics.view');
        Route::post('/logistics/items', [\App\Http\Controllers\Logistics\ItemController::class, 'store'])
            ->name('logistics.items.store')
            ->middleware('permission:logistics.manage');
        Route::get('/logistics/items/{id}', [\App\Http\Controllers\Logistics\ItemController::class, 'show'])
            ->name('logistics.items.show')
            ->middleware('permission:logistics.view');
        Route::put('/logistics/items/{id}', [\App\Http\Controllers\Logistics\ItemController::class, 'update'])
            ->name('logistics.items.update')
            ->middleware('permission:logistics.manage');
        Route::post('/logistics/items/{id}/stock-in', [\App\Http\Controllers\Logistics\ItemController::class, 'stockIn'])
            ->name('logistics.items.stock-in')
            ->middleware('permission:logistics.manage');
        Route::post('/logistics/items/{id}/adjust', [\App\Http\Controllers\Logistics\ItemController::class, 'adjustStock'])
            ->name('logistics.items.adjust')
            ->middleware('permission:logistics.manage');

        Route::get('/logistics/distributions', [\App\Http\Controllers\Logistics\DistributionController::class, 'index'])
            ->name('logistics.distributions.index')
            ->middleware('permission:logistics.view');
        Route::get('/logistics/distributions/create', [\App\Http\Controllers\Logistics\DistributionController::class, 'create'])
            ->name('logistics.distributions.create')
            ->middleware('permission:logistics.manage');
        Route::post('/logistics/distributions', [\App\Http\Controllers\Logistics\DistributionController::class, 'store'])
            ->name('logistics.distributions.store')
            ->middleware('permission:logistics.manage');
        Route::get('/logistics/distributions/{id}', [\App\Http\Controllers\Logistics\DistributionController::class, 'show'])
            ->name('logistics.distributions.show')
            ->middleware('permission:logistics.view');
            
    // Finance - Invoices
        Route::get('/finance/invoices', [\App\Http\Controllers\Finance\InvoiceController::class, 'index'])
            ->name('finance.invoices.index')
            ->middleware('permission:finance.view');
        Route::get('/finance/invoices/create', [\App\Http\Controllers\Finance\InvoiceController::class, 'create'])
            ->name('finance.invoices.create')
            ->middleware('permission:finance.manage');
        Route::post('/finance/invoices', [\App\Http\Controllers\Finance\InvoiceController::class, 'store'])
            ->name('finance.invoices.store')
            ->middleware('permission:finance.manage');
        Route::get('/finance/invoices/{id}', [\App\Http\Controllers\Finance\InvoiceController::class, 'show'])
            ->name('finance.invoices.show')
            ->middleware('permission:finance.view');
        Route::post('/finance/invoices/{id}/issue', [\App\Http\Controllers\Finance\InvoiceController::class, 'issue'])
            ->name('finance.invoices.issue')
            ->middleware('permission:finance.manage');
        Route::post('/finance/invoices/{id}/payments', [\App\Http\Controllers\Finance\InvoiceController::class, 'pay'])
            ->name('finance.invoices.pay')
            ->middleware('permission:finance.manage');
        Route::get('/finance/invoices/{id}/pdf', [\App\Http\Controllers\Finance\InvoiceController::class, 'downloadPdf'])
            ->name('finance.invoices.pdf')
            ->middleware('permission:finance.view');
            
        // Finance - Payrolls
        Route::get('/finance/payrolls', [\App\Http\Controllers\Finance\PayrollController::class, 'index'])
            ->name('finance.payrolls.index')
            ->middleware('permission:finance.view');
        Route::get('/finance/payrolls/create', [\App\Http\Controllers\Finance\PayrollController::class, 'create'])
            ->name('finance.payrolls.create')
            ->middleware('permission:finance.manage');
        Route::post('/finance/payrolls', [\App\Http\Controllers\Finance\PayrollController::class, 'store'])
            ->name('finance.payrolls.store')
            ->middleware('permission:finance.manage');
        Route::get('/finance/payrolls/{id}', [\App\Http\Controllers\Finance\PayrollController::class, 'show'])
            ->name('finance.payrolls.show')
            ->middleware('permission:finance.view');
        Route::post('/finance/payrolls/{id}/post', [\App\Http\Controllers\Finance\PayrollController::class, 'post'])
            ->name('finance.payrolls.post')
            ->middleware('permission:finance.manage');
        Route::get('/finance/payrolls/payslip/{id}', [\App\Http\Controllers\Finance\PayrollController::class, 'downloadPayslip'])
            ->name('finance.payrolls.payslip')
            ->middleware('permission:finance.view');
            
    // Reporting
        Route::get('/reports/ledger', [\App\Http\Controllers\Reporting\ReportController::class, 'ledger'])
            ->name('reports.ledger')
            ->middleware('permission:reports.view');
        Route::get('/reports/receivables', [\App\Http\Controllers\Reporting\ReportController::class, 'receivableSubsidiary'])
            ->name('reports.receivables')
            ->middleware('permission:reports.view');
        Route::get('/reports/income-statement', [\App\Http\Controllers\Reporting\ReportController::class, 'incomeStatement'])
            ->name('reports.income_statement')
            ->middleware('permission:reports.view');
        Route::get('/reports/balance-sheet', [\App\Http\Controllers\Reporting\ReportController::class, 'balanceSheet'])
            ->name('reports.balance_sheet')
            ->middleware('permission:reports.view');
        Route::get('/reports/cash-flow', [\App\Http\Controllers\Reporting\ReportController::class, 'cashFlow'])
            ->name('reports.cash_flow')
            ->middleware('permission:reports.view');
        Route::get('/reports/equity', [\App\Http\Controllers\Reporting\ReportController::class, 'equity'])
            ->name('reports.equity')
            ->middleware('permission:reports.view');
        Route::get('/reports/management', [\App\Http\Controllers\Reporting\ReportController::class, 'managementAnalysis'])
            ->name('reports.management')
            ->middleware('permission:reports.view');
        Route::get('/reports/bsc', [\App\Http\Controllers\Reporting\ReportController::class, 'bsc'])
            ->name('reports.bsc')
            ->middleware('permission:reports.view');

    Route::prefix('psb')->name('psb.')->group(function () {
        Route::get('/applicants', [\App\Http\Controllers\PSB\ApplicantController::class, 'index'])
            ->name('applicants.index')
            ->middleware('permission:recruitment.view');
        Route::get('/applicants/new', [\App\Http\Controllers\PSB\ApplicantController::class, 'create'])
            ->name('applicants.create')
            ->middleware('permission:recruitment.manage');
        Route::post('/applicants', [\App\Http\Controllers\PSB\ApplicantController::class, 'store'])
            ->name('applicants.store')
            ->middleware('permission:recruitment.manage');
        Route::get('/applicants/edit/{id}', [\App\Http\Controllers\PSB\ApplicantController::class, 'edit'])
            ->name('applicants.edit')
            ->middleware('permission:recruitment.manage');
        Route::put('/applicants/{id}', [\App\Http\Controllers\PSB\ApplicantController::class, 'update'])
            ->name('applicants.update')
            ->middleware('permission:recruitment.manage');
        Route::put('/applicants/{id}/status', [\App\Http\Controllers\PSB\ApplicantController::class, 'updateStatus'])
            ->name('applicants.update-status')
            ->middleware('permission:recruitment.manage');
    });
});

