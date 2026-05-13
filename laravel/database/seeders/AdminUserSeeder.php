<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        $password = 'password';

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make($password),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Demo User',
                'password' => Hash::make($password),
                'role' => 'user',
            ]
        );
    }
}
