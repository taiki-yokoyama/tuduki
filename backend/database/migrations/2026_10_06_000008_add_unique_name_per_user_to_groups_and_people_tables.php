<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('groups', function (Blueprint $table): void {
            $table->unique(['user_id', 'name'], 'groups_user_id_name_unique');
        });

        Schema::table('people', function (Blueprint $table): void {
            $table->dropIndex('people_user_id_name_index');
            $table->unique(['user_id', 'name'], 'people_user_id_name_unique');
        });
    }

    public function down(): void
    {
        Schema::table('people', function (Blueprint $table): void {
            $table->dropUnique('people_user_id_name_unique');
            $table->index(['user_id', 'name']);
        });

        Schema::table('groups', function (Blueprint $table): void {
            $table->dropUnique('groups_user_id_name_unique');
        });
    }
};
