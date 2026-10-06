<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('people', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->foreignId('group_id')->nullable()->constrained()->nullOnDelete();
            $table->text('notes')->nullable();
            $table->string('avatar_color', 50)->default('indigo');
            $table->timestamps();

            $table->index(['user_id', 'name']);
            $table->index(['user_id', 'group_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('people');
    }
};
