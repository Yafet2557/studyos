"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, ClipboardList, FileText, Brain, Timer, Settings } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Assignments", href: "/assignments", icon: ClipboardList },
  { label: "Notes", href: "/notes", icon: FileText },
];

const toolsNav = [
  { label: "Study", href: "/study", icon: Brain },
  { label: "Focus", href: "/focus", icon: Timer },
];

const settingsNav = [
  { label: "Settings", href: "/settings", icon: Settings },
];

function NavGroup({ label, items, pathname }: { label: string; items: typeof mainNav; pathname: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mt-4 mb-1.5 first:mt-0">
        {label}
      </p>
      <SidebarMenu>
        {items.map(({ label: itemLabel, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={active}
                className={active ? "bg-primary/10 text-primary" : ""}
              >
                <Link href={href} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{itemLabel}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </div>
  );
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      <NavGroup label="Main" items={mainNav} pathname={pathname} />
      <NavGroup label="Tools" items={toolsNav} pathname={pathname} />
      <NavGroup label="Account" items={settingsNav} pathname={pathname} />
    </div>
  );
}
