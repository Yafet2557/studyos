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
    <Sidebar className="glass border-r-0">
      <SidebarHeader className="px-5 py-5 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-sm)]">
            <span className="text-primary-foreground text-xs font-bold leading-none">S</span>
          </div>
          <span className="font-serif text-xl tracking-tight text-foreground">StudyOS</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarNav />
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4 pt-2 border-t border-border/30">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
