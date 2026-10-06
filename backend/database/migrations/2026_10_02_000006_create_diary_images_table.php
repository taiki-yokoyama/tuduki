<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diary_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('diary_id')->constrained()->cascadeOnDelete();
            $table->string('storage_path');
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'diary_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diary_images');
    }
};
