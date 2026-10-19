<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = App\Http\Requests\Security\PersonnelRequest::create('/security/personnels', 'POST', [
    'nik' => '9999999999999999',
    'full_name' => 'Test',
    'status' => 'active',
]);
$request->setContainer(app());
$request->setRedirector(app(Illuminate\Routing\Redirector::class));
$request->validateResolved();

print_r($request->validated());
