<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChambreController;
use App\Http\Controllers\Api\FormationController;
use App\Http\Controllers\Api\IntervenantController;
use App\Http\Controllers\Api\OrganisationController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\SalleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // Reservations
    Route::get('reservations/options', [ReservationController::class, 'options']);
    Route::get('reservations/available-chambres', [ReservationController::class, 'availableChambres']);
    Route::get('reservations/statistics', [ReservationController::class, 'statistics']);
    Route::apiResource('reservations', ReservationController::class)->parameters(['reservations' => 'id']);
    // Chambres
    Route::get('chambres/statistics', [ChambreController::class, 'statistics']);
    Route::get('chambres/analytics', [ChambreController::class, 'analytics']);
    Route::post('chambres/sync-status', [ChambreController::class, 'syncStatus']);
    Route::apiResource('chambres', ChambreController::class)->parameters(['chambres' => 'id']);

    // Salles
    Route::apiResource('salles', SalleController::class)->parameters(['salles' => 'id']);

    // Intervenants
    Route::get('intervenants/statistics', [IntervenantController::class, 'statistics']);
    Route::get('intervenants/organisations', [IntervenantController::class, 'organisations']);
    Route::apiResource('intervenants', IntervenantController::class)->parameters(['intervenants' => 'id']);

    Route::get('formations', [FormationController::class, 'index']);
    Route::post('formations', [FormationController::class, 'store']);
    Route::put('formations/{id_forma}', [FormationController::class, 'update']);
    Route::delete('formations/{id_forma}', [FormationController::class, 'destroy']);

    Route::get('organisations', [OrganisationController::class, 'index']);
    Route::post('organisations', [OrganisationController::class, 'store']);
    Route::put('organisations/{id_org}', [OrganisationController::class, 'update']);
    Route::delete('organisations/{id_org}', [OrganisationController::class, 'destroy']);
});
