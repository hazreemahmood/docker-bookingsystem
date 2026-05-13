<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Public service routes
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{id}', [ServiceController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Booking routes
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::patch('/bookings/{id}', [BookingController::class, 'update']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/bookings', [BookingController::class, 'adminIndex']);
        Route::patch('/admin/bookings/{id}/confirm', [BookingController::class, 'confirm']);
        Route::patch('/admin/bookings/{id}/book', [BookingController::class, 'book']);
        Route::patch('/admin/bookings/{id}/complete', [BookingController::class, 'complete']);
        Route::patch('/admin/bookings/{id}/approve', [BookingController::class, 'approve']);
        Route::patch('/admin/bookings/{id}/reject', [BookingController::class, 'reject']);
        Route::get('/admin/stats', [DashboardController::class, 'stats']);
    });
});
