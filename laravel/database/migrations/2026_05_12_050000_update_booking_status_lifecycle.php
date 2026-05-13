<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UpdateBookingStatusLifecycle extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('bookings')) {
            return;
        }

        DB::statement("ALTER TABLE bookings MODIFY status ENUM('pending', 'approved', 'confirmed', 'booked', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending'");
        DB::table('bookings')->where('status', 'approved')->update(['status' => 'confirmed']);
        DB::statement("ALTER TABLE bookings MODIFY status ENUM('pending', 'confirmed', 'booked', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending'");
    }

    public function down()
    {
        if (!Schema::hasTable('bookings')) {
            return;
        }

        DB::statement("ALTER TABLE bookings MODIFY status ENUM('pending', 'approved', 'confirmed', 'booked', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending'");
        DB::table('bookings')->whereIn('status', ['confirmed', 'booked'])->update(['status' => 'approved']);
        DB::statement("ALTER TABLE bookings MODIFY status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending'");
    }
}
