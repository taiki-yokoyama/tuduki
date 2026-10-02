<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diaries', function (Blueprint $table): void {
            $table->id();
            $table->text('content');
            $table->date('diary_date');
            $table->timestamps();
            $table->index('diary_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diaries');
    }
};
