<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Models\Group;
use App\Domain\Repositories\GroupRepository;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;

final class DbGroupRepository implements GroupRepository
{
    public function findByIdForUser(int $groupId, int $userId): ?Group
    {
        $row = DB::table('groups')
            ->where('id', $groupId)
            ->where('user_id', $userId)
            ->first();

        if ($row === null) {
            return null;
        }

        return new Group(
            userId: (int) $row->user_id,
            name: (string) $row->name,
            color: (string) $row->color,
            sortOrder: (int) $row->sort_order,
            id: (int) $row->id,
            createdAt: $this->toDateTime($row->created_at),
            updatedAt: $this->toDateTime($row->updated_at),
        );
    }

    private function toDateTime(mixed $value): ?DateTimeImmutable
    {
        return $value === null ? null : new DateTimeImmutable((string) $value);
    }
}
