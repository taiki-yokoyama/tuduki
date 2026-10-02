<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entry extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'body',
        'written_at',
    ];

    protected function casts(): array
    {
        return [
            'written_at' => 'date:Y-m-d',
        ];
    }
}
