'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function GTMPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page: url,
    });
  }, [pathname, searchParams]);

  return null;
}