'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex gap-6">
      <Link
        href="/dashboard/create-post"
        className={cn(
          'flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm',
          pathname === '/dashboard/create-post' ? 'text-foreground' : 'text-foreground/60'
        )}
      >
        Crear Publicación
      </Link>
      <Link
        href="#"
        className={cn(
            'flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm text-foreground/60 cursor-not-allowed opacity-50'
        )}
        onClick={(e) => e.preventDefault()}
      >
        Mis Publicaciones
      </Link>
    </nav>
  );
}
