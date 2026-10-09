<?php

declare(strict_types=1);

namespace App\Application\UseCases\Group;

use App\Application\Commands\Group\CreateGroupCommand;
use App\Application\Results\Group\GroupResult;
use App\Domain\Models\Group;
use App\Domain\Repositories\GroupRepository;

final class CreateGroupUseCase
{
    public function __construct(
        private GroupRepository $groupRepository,
    ) {
    }

    public function execute(int $userId, CreateGroupCommand $command): GroupResult
    {
        $group = new Group(
            userId: $userId,
            name: $command->name,
            color: $command->color,
            sortOrder: $command->sortOrder,
        );
        $createdGroup = $this->groupRepository->create($group);

        return new GroupResult($createdGroup);
    }
}
