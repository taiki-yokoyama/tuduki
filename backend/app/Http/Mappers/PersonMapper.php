<?php

declare(strict_types=1);

namespace App\Http\Mappers;

use App\Application\Results\Person\PersonResult;
use App\Domain\Models\Group;

final class PersonMapper
{
    /**
     * @param list<PersonResult> $results
     * @return list<array<string, mixed>>
     */
    public function toList(array $results): array
    {
        return array_map(
            fn (PersonResult $result): array => $this->toArray($result),
            $results,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(PersonResult $result): array
    {
        $person = $result->person;

        return [
            'id' => $person->getId(),
            'name' => (string) $person->getName(),
            'group_id' => $person->getGroupId(),
            'notes' => $person->getNotes(),
            'avatar_color' => $person->getAvatarColor(),
            'image_url' => $person->getImageUrl(),
            'created_at' => $person->getCreatedAt()?->format(DATE_ATOM),
            'group' => $result->group === null ? null : $this->groupToArray($result->group),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function groupToArray(Group $group): array
    {
        return [
            'id' => $group->getId(),
            'name' => (string) $group->getName(),
            'color' => $group->getColor(),
            'sort_order' => $group->getSortOrder(),
            'created_at' => $group->getCreatedAt()?->format(DATE_ATOM),
        ];
    }
}
