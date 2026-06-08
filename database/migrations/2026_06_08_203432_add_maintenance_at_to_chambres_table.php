<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('chambres', function (Blueprint $table) {
            $table->timestamp('maintenance_at')->nullable()->after('maintenance_duree');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chambres', function (Blueprint $table) {
            $table->dropColumn('maintenance_at');
        });
    }
};
