<?php

declare(strict_types=1);

namespace App\Application\UseCases\Group;

use App\Application\Queries\Group\ListGroupsQuery;
use App\Application\Results\Group\GroupResult;
use App\Domain\Repositories\GroupRepository;

final class ListGroupsUseCase
{
    public function __construct(
        private GroupRepository $groupRepository,
    ) {
    }

    /**
     * @return list<GroupResult>
     */
    public function execute(ListGroupsQuery $query): array
    {
        return array_map(
            fn ($group): GroupResult => new GroupResult($group),
            $this->groupRepository->findForUser($query->userId),
        );
    }
}
