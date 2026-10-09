<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\Commands\Group\CreateGroupCommand;
use App\Application\Queries\Group\ListGroupsQuery;
use App\Application\UseCases\Group\CreateGroupUseCase;
use App\Application\UseCases\Group\DeleteGroupUseCase;
use App\Application\UseCases\Group\ListGroupsUseCase;
use App\Http\Mappers\GroupMapper;
use App\Http\Requests\Api\GroupCreateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class GroupController
{
    public function __construct(
        private GroupMapper $groupMapper,
    ) {
    }

    public function index(Request $request, ListGroupsUseCase $useCase): JsonResponse
    {
        $userId = (int) $request->user()->getAuthIdentifier();
        $query = new ListGroupsQuery($userId);
        $groupResults = $useCase->execute($query);
        $groups = $this->groupMapper->toList($groupResults);

        return response()->json($groups);
    }

    public function store(GroupCreateRequest $request, CreateGroupUseCase $useCase): JsonResponse
    {
        $userId = (int) $request->user()->getAuthIdentifier();
        $validated = $request->validated();
        $createGroupCommand = new CreateGroupCommand(
            name: $validated['name'],
            color: $validated['color'] ?? 'indigo',
            sortOrder: (int) ($validated['sort_order'] ?? 0),
        );

        $groupResult = $useCase->execute($userId, $createGroupCommand);
        $group = $this->groupMapper->toArray($groupResult);

        return response()->json($group, 201);
    }

    public function destroy(Request $request, int $group, DeleteGroupUseCase $useCase): Response
    {
        $userId = (int) $request->user()->getAuthIdentifier();
        $useCase->execute($userId, $group);

        return response()->noContent();
    }
}
