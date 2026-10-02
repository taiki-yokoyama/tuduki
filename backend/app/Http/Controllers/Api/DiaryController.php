<?php

namespace App\Http\Controllers\Api;

use App\Models\Diary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiaryController
{
    public function index(): JsonResponse
    {
        return response()->json(Diary::query()->latest('diary_date')->latest('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $diary = Diary::create($request->validate([
            'content' => ['required', 'string'],
            'diary_date' => ['required', 'date'],
        ]));

        return response()->json($diary, 201);
    }

    public function show(Diary $diary): JsonResponse
    {
        return response()->json($diary);
    }

    public function update(Request $request, Diary $diary): JsonResponse
    {
        $diary->update($request->validate([
            'content' => ['sometimes', 'required', 'string'],
            'diary_date' => ['sometimes', 'required', 'date'],
        ]));

        return response()->json($diary->refresh());
    }

    public function destroy(Diary $diary): JsonResponse
    {
        $diary->delete();

        return response()->json(status: 204);
    }
}
