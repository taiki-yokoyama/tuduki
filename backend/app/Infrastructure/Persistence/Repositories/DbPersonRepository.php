<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Exceptions\PersonNameAlreadyExists;
use App\Domain\Exceptions\PersonNotFound;
use App\Domain\Models\Person;
use App\Domain\Repositories\PersonRepository;
use DateTimeImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

final class DbPersonRepository implements PersonRepository
{
    /**
     * @return list<Person>
     */
    public function findForUser(int $userId, ?int $groupId = null): array
    {
        $query = DB::table('people')
            ->where('user_id', $userId)
            ->orderBy('name')
            ->orderBy('id');

        if ($groupId !== null) {
            $query->where('group_id', $groupId);
        }

        return $query->get()
            ->map(fn (object $row): Person => $this->toDomain($row))
            ->all();
    }

    public function findByIdForUser(int $personId, int $userId): ?Person
    {
        $row = DB::table('people')
            ->where('id', $personId)
            ->where('user_id', $userId)
            ->first();

        return $row === null ? null : $this->toDomain($row);
    }

    public function create(Person $person): Person
    {
        $timestamp = now();

        try {
            $id = DB::table('people')->insertGetId([
                'user_id' => $person->getUserId(),
                ...$this->attributes($person),
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);
        } catch (QueryException $exception) {
            $this->throwIfDuplicateName($exception);
            throw $exception;
        }

        $created = $this->findByIdForUser((int) $id, $person->getUserId());

        if ($created === null) {
            throw new PersonNotFound();
        }

        return $created;
    }

    public function update(Person $person): Person
    {
        if ($person->getId() === null) {
            throw new PersonNotFound();
        }

        try {
            DB::table('people')
                ->where('id', $person->getId())
                ->where('user_id', $person->getUserId())
                ->update([
                    ...$this->attributes($person),
                    'updated_at' => now(),
                ]);
        } catch (QueryException $exception) {
            $this->throwIfDuplicateName($exception);
            throw $exception;
        }

        $updated = $this->findByIdForUser($person->getId(), $person->getUserId());

        if ($updated === null) {
            throw new PersonNotFound();
        }

        return $updated;
    }

    /**
     * @return array{name: string, group_id: int|null, notes: string|null, avatar_color: string, image_url: string|null}
     */
    private function attributes(Person $person): array
    {
        return [
            'name' => (string) $person->getName(),
            'group_id' => $person->getGroupId(),
            'notes' => $person->getNotes(),
            'avatar_color' => $person->getAvatarColor(),
            'image_url' => $person->getImageUrl(),
        ];
    }

    private function toDomain(object $row): Person
    {
        return new Person(
            userId: (int) $row->user_id,
            name: (string) $row->name,
            groupId: $row->group_id === null ? null : (int) $row->group_id,
            notes: $row->notes === null ? null : (string) $row->notes,
            avatarColor: (string) $row->avatar_color,
            imageUrl: $row->image_url === null ? null : (string) $row->image_url,
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
            throw new PersonNameAlreadyExists();
        }
    }
}
