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
        <SidebarMenuButton asChild isActive={pathname === '/dashboard/create-post'}>
          <Link href="/dashboard/create-post">
            <FilePlus />
            Crear Publicación
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild disabled>
          <Link href="#">
            <LayoutGrid />
            Mis Publicaciones
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
