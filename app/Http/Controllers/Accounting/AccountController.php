<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use App\Enums\AccountCategory;
use App\Enums\NormalBalance;
use App\Enums\CashFlowGroup;

class AccountController extends Controller
{
    public function index(): Response
    {
        $accounts = DB::table('accounts')
            ->orderBy('code')
            ->get();
            
        return Inertia::render('Accounting/Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Accounting/Accounts/Form', [
            'account' => null,
            'parents' => DB::table('accounts')->orderBy('code')->get(),
            'categories' => array_column(AccountCategory::cases(), 'value'),
            'normalBalances' => array_column(NormalBalance::cases(), 'value'),
            'cashFlowGroups' => array_column(CashFlowGroup::cases(), 'value'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:accounts,code|max:255',
            'name' => 'required|string|max:255',
            'category' => ['required', Rule::enum(AccountCategory::class)],
            'normal_balance' => ['required', Rule::enum(NormalBalance::class)],
            'parent_id' => 'nullable|exists:accounts,id',
            'cash_flow_group' => ['nullable', Rule::enum(CashFlowGroup::class)],
            'is_active' => 'boolean',
        ]);
        
        DB::table('accounts')->insert(array_merge($validated, [
            'is_active' => $validated['is_active'] ?? true,
            'is_system' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]));
        
        activity()
            ->causedBy($request->user())
            ->event('created')
            ->log('Menambahkan akun COA ' . $validated['code']);
            
        return redirect()->route('accounts.index')->with('success', 'Akun berhasil ditambahkan.');
    }

    public function edit(string $id): Response
    {
        $account = DB::table('accounts')->where('id', $id)->first();
        if (!$account) abort(404);
        
        return Inertia::render('Accounting/Accounts/Form', [
            'account' => $account,
            'parents' => DB::table('accounts')->where('id', '!=', $id)->orderBy('code')->get(),
            'categories' => array_column(AccountCategory::cases(), 'value'),
            'normalBalances' => array_column(NormalBalance::cases(), 'value'),
            'cashFlowGroups' => array_column(CashFlowGroup::cases(), 'value'),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $account = DB::table('accounts')->where('id', $id)->first();
        if (!$account) abort(404);
        
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255', Rule::unique('accounts')->ignore($id)],
            'name' => 'required|string|max:255',
            'category' => ['required', Rule::enum(AccountCategory::class)],
            'normal_balance' => ['required', Rule::enum(NormalBalance::class)],
            'parent_id' => 'nullable|exists:accounts,id',
            'cash_flow_group' => ['nullable', Rule::enum(CashFlowGroup::class)],
            'is_active' => 'boolean',
        ]);
        
        DB::table('accounts')
            ->where('id', $id)
            ->update(array_merge($validated, [
                'is_active' => $validated['is_active'] ?? true,
                'updated_at' => now(),
            ]));
            
        activity()
            ->causedBy($request->user())
            ->event('updated')
            ->log('Memperbarui akun COA ' . $validated['code']);
            
        return redirect()->route('accounts.index')->with('success', 'Akun berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $account = DB::table('accounts')->where('id', $id)->first();
        if (!$account) abort(404);
        
        // Pencegahan penghapusan akun sistem
        if ($account->is_system) {
            return redirect()->back()->with('error', 'Akun sistem tidak dapat dihapus.');
        }
        
        // Pencegahan penghapusan akun yang memiliki mutasi (ada di journal_lines)
        $hasMutations = DB::table('journal_lines')->where('account_id', $id)->exists();
        if ($hasMutations) {
            return redirect()->back()->with('error', 'Akun tidak dapat dihapus karena sudah memiliki riwayat mutasi jurnal.');
        }
        
        // Check if has children
        $hasChildren = DB::table('accounts')->where('parent_id', $id)->exists();
        if ($hasChildren) {
            return redirect()->back()->with('error', 'Akun tidak dapat dihapus karena masih memiliki sub-akun.');
        }
        
        DB::table('accounts')->where('id', $id)->delete();
        
        activity()
            ->causedBy(auth()->user())
            ->event('deleted')
            ->log('Menghapus akun COA ' . $account->code);
            
        return redirect()->route('accounts.index')->with('success', 'Akun berhasil dihapus.');
    }
}
