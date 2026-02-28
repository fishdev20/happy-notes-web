"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Archive,
  Calendar,
  ChevronRight,
  Dot,
  Home,
  LogOut,
  Settings,
  SquarePen,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import useToastStore from "@/store/use-toast-store";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: SquarePen,
    submenus: [
      {
        title: "All Notes",
        url: "/notes",
      },
      {
        title: "New Note",
        url: "/notes/new",
      },
    ],
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Archive",
    url: "/archive",
    icon: Archive,
  },
  {
    title: "Trash",
    url: "/trash",
    icon: Trash,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const pushToast = useToastStore((state) => state.pushToast);
  const { open } = useSidebar();
  const [isNotesOpen, setIsNotesOpen] = React.useState(pathname.startsWith("/notes"));
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  React.useEffect(() => {
    setIsNotesOpen(pathname.startsWith("/notes"));
  }, [pathname]);

  async function handleSignOut() {
    setIsSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setIsSigningOut(false);

    if (error) {
      pushToast({
        title: "Sign out failed",
        description: error.message,
        variant: "error",
      });
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <Sidebar className="top-[4rem]" variant="inset" {...props} collapsible="icon">
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isSubmenuActive = item.submenus?.some((submenu) =>
                  pathname.startsWith(submenu.url),
                );
                const isActive = pathname === item.url || isSubmenuActive;

                if (item.submenus) {
                  return (
                    <div key={item.title}>
                      {!open ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <SidebarMenuItem>
                              <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                                <Link href={`${item.url}`} prefetch>
                                  <item.icon />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56" side="right">
                            {item.submenus.map((sub) => {
                              return (
                                <DropdownMenuItem
                                  asChild
                                  key={sub.url}
                                  className={pathname === sub.url ? "bg-muted text-primary" : ""}
                                >
                                  <Link href={`${sub.url}`} prefetch>
                                    <span>{sub.title}</span>
                                  </Link>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <SidebarMenuItem key={item.title}>
                          <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen}>
                            <CollapsibleTrigger asChild className="cursor-pointer">
                              <SidebarMenuButton
                                className="flex items-center justify-between w-full"
                                tooltip={item.title}
                                isActive={isActive}
                              >
                                <item.icon />
                                <span>{item.title}</span>
                                <ChevronRight
                                  className={`ml-auto transition-transform duration-200 ${isNotesOpen ? "rotate-90" : ""}`}
                                />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                              <SidebarMenuSub>
                                {item.submenus.map((submenu) => {
                                  const isSubmenuSelected = pathname === submenu.url;
                                  return (
                                    <SidebarMenuSubItem key={submenu.url}>
                                      <SidebarMenuSubButton asChild isActive={isSubmenuSelected}>
                                        <Link href={submenu.url} className="w-full" prefetch>
                                          <span>
                                            <Dot size={18} />
                                          </span>
                                          <span>{submenu.title}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  );
                                })}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        </SidebarMenuItem>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                        <Link href={`${item.url}`} prefetch>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign out"
              disabled={isSigningOut}
              className="cursor-pointer"
            >
              <LogOut />
              <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
