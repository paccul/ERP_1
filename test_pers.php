<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email','admin@garda.local')->first();
Auth::login($user);

$request = App\Http\Requests\Security\PersonnelRequest::create('/security/personnels', 'POST', [
    'nik' => '1234567890123457',
    'full_name' => 'Satpam Test',
    'birth_place' => 'Jakarta',
    'birth_date' => '1990-01-01',
    'gender' => 'male',
    'address' => 'Jl. Test',
    'phone' => '081234567890',
    'email' => 'satpam@test.com',
    'status' => 'active',
    'joined_at' => '2026-10-05',
]);
$request->setUserResolver(function() use ($user) { return $user; });
$request->setContainer(app());
$request->setRedirector(app(Illuminate\Routing\Redirector::class));
$request->validateResolved();

$controller = new App\Http\Controllers\Security\PersonnelController();
$response = $controller->store($request);
echo "Status: " . $response->getStatusCode() . "\n";
print_r(session()->all());
