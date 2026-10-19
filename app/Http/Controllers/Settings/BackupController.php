<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BackupController extends Controller
{
    public function index(): Response
    {
        $disk = Storage::disk(config('backup.backup.destination.disks')[0] ?? 'local');
        $files = $disk->allFiles(config('backup.backup.name'));

        $backups = [];
        foreach ($files as $file) {
            if (substr($file, -4) === '.zip') {
                $backups[] = [
                    'file_name' => str_replace(config('backup.backup.name') . '/', '', $file),
                    'file_size' => $this->humanFilesize($disk->size($file)),
                    'created_at' => \Carbon\Carbon::createFromTimestamp($disk->lastModified($file))->toDateTimeString(),
                ];
            }
        }

        // Sort backups by newest first
        usort($backups, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return Inertia::render('Settings/Backups/Index', [
            'backups' => $backups,
        ]);
    }

    public function store(Request $request)
    {
        // For security and timeout reasons, you usually run backup via queue or job.
        // We'll dispatch a command to run in background.
        
        try {
            Artisan::call('backup:run', ['--only-db' => true]);
            
            activity()
                ->causedBy($request->user())
                ->event('created')
                ->log('Membuat backup database manual');
                
            return back()->with('success', 'Proses backup berhasil dijalankan.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menjalankan backup: ' . $e->getMessage());
        }
    }

    public function download(string $file_name): BinaryFileResponse
    {
        $disk = Storage::disk(config('backup.backup.destination.disks')[0] ?? 'local');
        $path = config('backup.backup.name') . '/' . $file_name;
        
        if ($disk->exists($path)) {
            activity()
                ->causedBy(auth()->user())
                ->event('downloaded')
                ->log('Mengunduh backup ' . $file_name);
                
            return response()->download($disk->path($path));
        }

        abort(404, 'File backup tidak ditemukan.');
    }

    public function destroy(string $file_name)
    {
        $disk = Storage::disk(config('backup.backup.destination.disks')[0] ?? 'local');
        $path = config('backup.backup.name') . '/' . $file_name;

        if ($disk->exists($path)) {
            $disk->delete($path);
            
            activity()
                ->causedBy(auth()->user())
                ->event('deleted')
                ->log('Menghapus backup ' . $file_name);
                
            return back()->with('success', 'File backup berhasil dihapus.');
        }

        return back()->with('error', 'File backup tidak ditemukan.');
    }
    
    private function humanFilesize($bytes, $decimals = 2)
    {
        $size = array('B','kB','MB','GB','TB','PB','EB','ZB','YB');
        $factor = floor((strlen($bytes) - 1) / 3);
        return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . @$size[$factor];
    }
}
