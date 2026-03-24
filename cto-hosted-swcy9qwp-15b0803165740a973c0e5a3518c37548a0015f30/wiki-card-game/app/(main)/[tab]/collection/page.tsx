'use client';

import { useState } from 'react';
import { CardGrid } from '@/components/features/CardGrid';

export default function CollectionPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div>
      <CardGrid refreshTrigger={refreshTrigger} />
    </div>
  );
}
