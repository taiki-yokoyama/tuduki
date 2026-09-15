'use client';

import { useCallback } from 'react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

interface ScrollRevealWrapperProps {
  children: React.ReactNode;
}

export function ScrollRevealWrapper({ children }: ScrollRevealWrapperProps) {
  const ref = useScrollReveal<HTMLDivElement>();

  return <div ref={ref}>{children}</div>;
}
