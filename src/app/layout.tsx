import AppBreadCrumb from "@/components/app-breadcrumb";
import { AppSidebar } from "@/components/app-sidebar";
import { NavigationMenuDemo } from "@/components/nav-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const HEADER_HEIGHT = "4rem";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
        style={
          {
            "--header-height": HEADER_HEIGHT,
          } as React.CSSProperties
        }
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="flex h-[4rem] shrink-0 items-center gap-2 border-b px-4">
            <Image
              className="dark:invert"
              src="https://cdn6.aptoide.com/imgs/5/7/4/574859cec3b8da1781b67ccc76c26d4f_icon.png"
              alt="Next.js logo"
              width={45}
              height={45}
              priority
            />
            <NavigationMenuDemo />
          </header>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="h-full peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4)-4rem)]">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <AppBreadCrumb />
              </header>
              <ScrollArea className="h-[calc(100svh-theme(spacing.4)-(4rem*2))]">
                <div className="p-2">{children}</div>
              </ScrollArea>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
