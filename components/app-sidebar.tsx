import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { signOut } from "@/lib/auth"

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Courses", href: "/courses" },
  { label: "Assignments", href: "/assignments" },
  { label: "Notes", href: "/notes" },
]

async function logout() {
  "use server"
  await signOut({ redirectTo: "/login" })
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <span className="text-lg font-semibold">StudyOS</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link href={item.href}>{item.label}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3">
        <form action={logout}>
          <button
            type="submit"
            className="w-full text-left px-2 py-1.5 text-sm text-gray-500 hover:text-gray-900 rounded"
          >
            Sign out
          </button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
