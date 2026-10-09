<?php

declare(strict_types=1);

namespace App\Http\Mappers;

use App\Application\Results\Group\GroupResult;

final class GroupMapper
{
    /**
     * @param list<GroupResult> $results
     * @return list<array<string, mixed>>
     */
    public function toList(array $results): array
    {
        return array_map(
            fn (GroupResult $result): array => $this->toArray($result),
            $results,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(GroupResult $result): array
    {
        $group = $result->group;

        return [
            'id' => $group->getId(),
            'name' => (string) $group->getName(),
            'color' => $group->getColor(),
            'sort_order' => $group->getSortOrder(),
            'created_at' => $group->getCreatedAt()?->format(DATE_ATOM),
        ];
    }
}
