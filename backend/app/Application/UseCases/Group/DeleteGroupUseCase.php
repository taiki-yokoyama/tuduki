<?php

declare(strict_types=1);

namespace App\Application\UseCases\Group;

use App\Domain\Repositories\GroupRepository;

final class DeleteGroupUseCase
{
    public function __construct(
        private GroupRepository $groupRepository,
    ) {
    }

    public function execute(int $userId, int $groupId): void
    {
        $this->groupRepository->delete($groupId, $userId);
    }
}
