'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/data';

interface EntryImageGalleryProps {
  storagePaths: string[];
  className?: string;
}

export function EntryImageGallery({ storagePaths, className }: EntryImageGalleryProps) {
  if (storagePaths.length === 0) return null;

  if (storagePaths.length === 1) {
    return (
      <div className={cn('img-zoom rounded-md overflow-hidden border border-gray-200', className)}>
        <SmartImage path={storagePaths[0]} className="w-full max-h-80 object-cover" />
      </div>
    );
  }

  if (storagePaths.length === 2) {
    return (
      <div className={cn('grid grid-cols-2 gap-1.5', className)}>
        {storagePaths.map((path) => (
          <div key={path} className="img-zoom rounded-md overflow-hidden aspect-square border border-gray-200">
            <SmartImage path={path} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-3 gap-1.5', className)}>
      {storagePaths.slice(0, 4).map((path, idx) => (
        <div
          key={path}
          className={cn(
            'img-zoom rounded-md overflow-hidden relative border border-gray-200',
            idx === 0 && 'col-span-2 row-span-2 aspect-square',
            idx !== 0 && 'aspect-square'
          )}
        >
          <SmartImage path={path} className="w-full h-full object-cover" />
          {idx === 3 && storagePaths.length > 4 && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">+{storagePaths.length - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SmartImage({ path, className }: { path: string; className?: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100', className)}>
        <ImageOff className="w-5 h-5 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={getImageUrl(path)}
      alt=""
      loading="lazy"
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      className={cn(className, !loaded && 'shimmer')}
    />
  );
}
