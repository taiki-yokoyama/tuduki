<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diaries', function (Blueprint $table): void {
            $table->foreignId('user_id')->after('id')->constrained()->cascadeOnDelete();
            $table->index(['user_id', 'diary_date']);
        });
    }

    public function down(): void
    {
        Schema::table('diaries', function (Blueprint $table): void {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id', 'diary_date']);
            $table->dropColumn('user_id');
        });
    }
};
