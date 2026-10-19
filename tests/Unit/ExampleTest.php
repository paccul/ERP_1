<?php

it('menjalankan stack pengujian Pest', function () {
    expect(config('app.name'))->not->toBeEmpty();
});
