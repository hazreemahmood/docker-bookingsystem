<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            AdminUserSeeder::class,
            ServiceSeeder::class,
        ]);

        // If you later want additional demo users, add them here.
        // \App\Models\User::factory(10)->create();
    }
}

