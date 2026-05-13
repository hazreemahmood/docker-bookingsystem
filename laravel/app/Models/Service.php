<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'duration_minutes',
        'base_price',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
