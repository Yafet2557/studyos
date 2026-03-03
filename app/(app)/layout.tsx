import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { Toaster } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
          <span className="text-xs font-mono text-muted-foreground tracking-wide">{dateStr}</span>
        </div>
        <div className="flex-1 p-6 max-w-5xl w-full mx-auto">
          {children}
        </div>
      </main>
      <CommandPalette />
      <Toaster position="bottom-right" richColors />
    </SidebarProvider>
  );
}
