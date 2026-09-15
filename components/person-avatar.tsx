import { cn } from '@/lib/utils';
import type { Person } from '@/lib/types';

interface PersonAvatarProps {
  person: Pick<Person, 'name' | 'avatar_color'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
};

export function PersonAvatar({ person, size = 'md', className }: PersonAvatarProps) {
  const initials = getInitials(person.name);
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold shrink-0',
        `avatar-${person.avatar_color}`,
        sizeMap[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
