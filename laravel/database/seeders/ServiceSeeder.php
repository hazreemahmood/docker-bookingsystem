<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    public function run()
    {
        $services = [
            [
                'name' => 'Basic Cleaning',
                'description' => 'Standard cleaning service for residential areas.',
                'duration_minutes' => 60,
                'base_price' => 50.00,
            ],
            [
                'name' => 'Deep Cleaning',
                'description' => 'Thorough deep cleaning for kitchens, bathrooms, and more.',
                'duration_minutes' => 120,
                'base_price' => 120.00,
            ],
            [
                'name' => 'Move-in/Move-out Cleaning',
                'description' => 'Professional cleaning tailored for move-in or move-out.',
                'duration_minutes' => 90,
                'base_price' => 90.00,
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['name' => $service['name']],
                $service
            );
        }
    }
}

