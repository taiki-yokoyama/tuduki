<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\Commands\Person\CreatePersonCommand;
use App\Application\Commands\Person\UpdatePersonCommand;
use App\Application\Queries\Person\ListPeopleQuery;
use App\Application\UseCases\Person\CreatePersonUseCase;
use App\Application\UseCases\Person\ListPeopleUseCase;
use App\Application\UseCases\Person\UpdatePersonUseCase;
use App\Http\Requests\Api\PersonCreateRequest;
use App\Http\Requests\Api\PersonIndexRequest;
use App\Http\Requests\Api\PersonUpdateRequest;
use App\Http\Mappers\PersonMapper;
use Illuminate\Http\JsonResponse;

final class PersonController
{
    public function __construct(
        private PersonMapper $personMapper,
    ) {
    }

    public function index(PersonIndexRequest $request, ListPeopleUseCase $useCase): JsonResponse
    {
        $userId = (int) $request->user()->getAuthIdentifier();
        $validatedGroupId = $request->validated('group_id');
        $groupId = $validatedGroupId === null ? null : (int) $validatedGroupId;

        $query = new ListPeopleQuery($userId, $groupId);
        $personResults = $useCase->execute($query);
        $people = $this->personMapper->toList($personResults);

        return response()->json($people);
    }

    public function store(PersonCreateRequest $request, CreatePersonUseCase $useCase): JsonResponse
    {
        $userId = (int) $request->user()->getAuthIdentifier();
        $validated = $request->validated();
        $groupId = array_key_exists('group_id', $validated) && $validated['group_id'] !== null
            ? (int) $validated['group_id']
            : null;
        $createPersonCommand = new CreatePersonCommand(
            name: $validated['name'],
            groupId: $groupId,
            notes: $validated['notes'] ?? null,
            avatarColor: $validated['avatar_color'] ?? 'indigo',
            imageUrl: $validated['image_url'] ?? null,
        );

        $personResult = $useCase->execute($userId, $createPersonCommand);
        $person = $this->personMapper->toArray($personResult);

        return response()->json($person, 201);
    }

    public function update(
        PersonUpdateRequest $request,
        int $person,
        UpdatePersonUseCase $useCase,
    ): JsonResponse {
        $userId = (int) $request->user()->getAuthIdentifier();
        $validated = $request->validated();
        $groupId = array_key_exists('group_id', $validated) && $validated['group_id'] !== null
            ? (int) $validated['group_id']
            : null;
        $updatePersonCommand = new UpdatePersonCommand(
            hasName: array_key_exists('name', $validated),
            name: $validated['name'] ?? null,
            hasGroupId: array_key_exists('group_id', $validated),
            groupId: $groupId,
            hasNotes: array_key_exists('notes', $validated),
            notes: $validated['notes'] ?? null,
            hasAvatarColor: array_key_exists('avatar_color', $validated),
            avatarColor: $validated['avatar_color'] ?? null,
            hasImageUrl: array_key_exists('image_url', $validated),
            imageUrl: $validated['image_url'] ?? null,
        );

        $personResult = $useCase->execute(
            $userId,
            $person,
            $updatePersonCommand,
        );
        $person = $this->personMapper->toArray($personResult);

        return response()->json($person);
    }
}
