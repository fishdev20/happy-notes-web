"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Archive, Calendar, ChevronRight, Dot, Home, SquarePen, Trash } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Notes",
    url: "", // We'll detect activity via submenus
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
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [isNotesOpen, setIsNotesOpen] = React.useState(pathname.startsWith("/notes"));

  // React.useEffect(() => {
  //   if (pathname.includes("/notes")) {
  //     setIsNotesOpen(true);
  //   } else {
  //     setIsNotesOpen(false);
  //   }
  // }, [pathname]);

  return (
    <Sidebar className="top-[4rem]" variant="inset" {...props} collapsible="icon">
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const isSubmenuActive = item.submenus?.some((submenu) =>
              pathname.startsWith(submenu.url),
            );
            const isActive = pathname === item.url || isSubmenuActive;

            if (item.submenus) {
              return (
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
                                <Link href={submenu.url} className="w-full">
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
              );
            } else {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link href={`${item.url}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
