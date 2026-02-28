import AppBreadCrumb from "@/components/app-breadcrumb";
import RoutePrefetcher from "@/components/route-prefetcher";
import { AppSidebar } from "@/components/app-sidebar";
import { NavigationMenuDemo } from "@/components/nav-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Suspense } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 h-svh overflow-hidden">
      <RoutePrefetcher />
      <header className="flex h-[4rem] shrink-0 items-center gap-2 border-b border-border/70 bg-background/60 px-4 backdrop-blur">
        <NavigationMenuDemo />
      </header>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-full bg-transparent peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4)-4rem)]">
          <header className="flex h-16 shrink-0 items-center gap-2 rounded-t-xl border border-border/70 bg-background/55 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AppBreadCrumb />
          </header>
          <ScrollArea className="h-[calc(100svh-theme(spacing.4)-(4rem*2))] rounded-b-xl border border-border/70 bg-background/45 backdrop-blur">
            <Suspense fallback={null}>{children}</Suspense>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
