<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about', function (): void {
    $this->comment('Tuduki API');
})->purpose('Display application information');
