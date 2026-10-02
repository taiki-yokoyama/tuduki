<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entries', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 120);
            $table->text('body');
            $table->date('written_at');
            $table->timestamps();
            $table->index('written_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entries');
    }
};
