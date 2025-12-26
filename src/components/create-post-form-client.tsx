'use client';

import { useEffect, useState } from 'react';
import { CreatePostForm } from './create-post-form';
import { Skeleton } from './ui/skeleton';

export function CreatePostFormClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Muestra un esqueleto de carga en el servidor y durante la hidratación inicial
    return (
        <div className="space-y-8">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[800px] w-full" />
        </div>
    );
  }

  return <CreatePostForm />;
}
