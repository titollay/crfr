<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('intervenants', function (Blueprint $table) {
            $table->string('cadre')->nullable()->change();
            $table->string('mission')->nullable()->change();
            $table->boolean('a_formation')->default(false)->after('adresse');
        });
    }

    public function down(): void
    {
        Schema::table('intervenants', function (Blueprint $table) {
            $table->dropColumn('a_formation');
            $table->string('cadre')->nullable(false)->change();
            $table->string('mission')->nullable(false)->change();
        });
    }
};
