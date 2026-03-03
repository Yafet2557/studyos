import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { LogOut } from "lucide-react";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-border/60">
      <SidebarHeader className="px-5 py-5 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-xs font-bold leading-none">S</span>
          </div>
          <span className="font-serif text-lg tracking-tight text-foreground">StudyOS</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarNav />
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4 pt-2 border-t border-border/40">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
