<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Diary extends Model
{
    use HasFactory;

    protected $fillable = [
        'content',
        'diary_date',
    ];

    protected function casts(): array
    {
        return [
            'diary_date' => 'date:Y-m-d',
        ];
    }
}
