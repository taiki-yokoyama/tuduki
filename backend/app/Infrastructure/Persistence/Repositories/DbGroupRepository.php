<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Exceptions\GroupNameAlreadyExists;
use App\Domain\Exceptions\GroupNotFound;
use App\Domain\Models\Group;
use App\Domain\Repositories\GroupRepository;
use DateTimeImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

final class DbGroupRepository implements GroupRepository
{
    /**
     * @return list<Group>
     */
    public function findForUser(int $userId): array
    {
        return DB::table('groups')
            ->where('user_id', $userId)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (object $row): Group => $this->toDomain($row))
            ->all();
    }

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

    public function create(Group $group): Group
    {
        $timestamp = now();

        try {
            $id = DB::table('groups')->insertGetId([
                'user_id' => $group->getUserId(),
                'name' => (string) $group->getName(),
                'color' => $group->getColor(),
                'sort_order' => $group->getSortOrder(),
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);
        } catch (QueryException $exception) {
            $this->throwIfDuplicateName($exception);
            throw $exception;
        }

        $created = $this->findByIdForUser((int) $id, $group->getUserId());

        if ($created === null) {
            throw new GroupNotFound();
        }

        return $created;
    }

    public function delete(int $groupId, int $userId): void
    {
        $deleted = DB::transaction(function () use ($groupId, $userId): int {
            DB::table('people')
                ->where('user_id', $userId)
                ->where('group_id', $groupId)
                ->update([
                    'group_id' => null,
                    'updated_at' => now(),
                ]);

            return DB::table('groups')
                ->where('id', $groupId)
                ->where('user_id', $userId)
                ->delete();
        });

        if ($deleted === 0) {
            throw new GroupNotFound();
        }
    }

    private function toDomain(object $row): Group
    {
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

    private function throwIfDuplicateName(QueryException $exception): void
    {
        if (($exception->errorInfo[1] ?? null) === 1062) {
            throw new GroupNameAlreadyExists();
        }
    }
}
