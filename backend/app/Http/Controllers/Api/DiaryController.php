<?php

namespace App\Http\Controllers\Api;

use App\Models\Diary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DiaryController
{
    public function index(): JsonResponse
    {
        return response()->json(
            Diary::query()
                ->whereBelongsTo(Auth::user())
                ->latest('diary_date')
                ->latest('id')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $diary = Diary::create([
            'user_id' => Auth::id(),
            ...$request->validate([
                'content' => ['required', 'string'],
                'diary_date' => ['required', 'date'],
            ]),
        ]);

        return response()->json($diary, 201);
    }

    public function show(Diary $diary): JsonResponse
    {
        abort_unless($diary->user_id === Auth::id(), 404);

        return response()->json($diary);
    }

    public function update(Request $request, Diary $diary): JsonResponse
    {
        abort_unless($diary->user_id === Auth::id(), 404);

        $diary->update($request->validate([
            'content' => ['sometimes', 'required', 'string'],
            'diary_date' => ['sometimes', 'required', 'date'],
        ]));

        return response()->json($diary->refresh());
    }

    public function destroy(Diary $diary): JsonResponse
    {
        abort_unless($diary->user_id === Auth::id(), 404);

        $diary->delete();

        return response()->json(status: 204);
    }
}
