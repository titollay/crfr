<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ChambreController;
use App\Http\Controllers\Api\IntervenantController;

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
    Route::apiResource('chambres', ChambreController::class)->parameters(['chambres' => 'id']);

    // Intervenants
    Route::get('intervenants/statistics', [IntervenantController::class, 'statistics']);
    Route::get('intervenants/organisations', [IntervenantController::class, 'organisations']);
    Route::apiResource('intervenants', IntervenantController::class)->parameters(['intervenants' => 'id']);
});
