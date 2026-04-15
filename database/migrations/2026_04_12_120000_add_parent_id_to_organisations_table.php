<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organisations', function (Blueprint $table) {
            if (!Schema::hasColumn('organisations', 'parent_id')) {
                $table->unsignedBigInteger('parent_id')->nullable()->after('type');
                $table->foreign('parent_id')
                    ->references('id_org')
                    ->on('organisations')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('organisations', function (Blueprint $table) {
            if (Schema::hasColumn('organisations', 'parent_id')) {
                $table->dropForeign(['parent_id']);
                $table->dropColumn('parent_id');
            }
        });
    }
};
