<?php

it('mengalihkan tamu dari root aplikasi tanpa error server', function () {
    $response = $this->get('/');

    expect($response->status())->toBeLessThan(500);
});
