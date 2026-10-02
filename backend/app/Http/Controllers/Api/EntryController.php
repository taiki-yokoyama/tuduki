<?php

namespace App\Http\Controllers\Api;

use App\Models\Entry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntryController
{
    public function index(): JsonResponse
    {
        return response()->json(Entry::query()->latest('written_at')->latest('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $entry = Entry::create($request->validate([
            'title' => ['required', 'string', 'max:120'],
            'body' => ['required', 'string'],
            'written_at' => ['required', 'date'],
        ]));

        return response()->json($entry, 201);
    }

    public function show(Entry $entry): JsonResponse
    {
        return response()->json($entry);
    }

    public function update(Request $request, Entry $entry): JsonResponse
    {
        $entry->update($request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:120'],
            'body' => ['sometimes', 'required', 'string'],
            'written_at' => ['sometimes', 'required', 'date'],
        ]));

        return response()->json($entry->refresh());
    }

    public function destroy(Entry $entry): JsonResponse
    {
        $entry->delete();

        return response()->json(status: 204);
    }
}
