'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FilePlus, LayoutGrid } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/dashboard/create-post" passHref legacyBehavior>
          <SidebarMenuButton asChild isActive={pathname === '/dashboard/create-post'}>
            <a>
              <FilePlus />
              Crear Publicación
            </a>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="#" passHref legacyBehavior>
          <SidebarMenuButton asChild disabled>
            <a>
              <LayoutGrid />
              Mis Publicaciones
            </a>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
