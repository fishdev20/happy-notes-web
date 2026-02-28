import QueryProvider from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import Toaster from "@/components/ui/toaster";
import type { Metadata } from "next";
import localFont from "next/font/local";
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
  title: "Happy Notes",
  description: "A markdown-first note workspace with archive, trash, and calendar views.",
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
        className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden antialiased`}
        style={
          {
            "--header-height": HEADER_HEIGHT,
          } as React.CSSProperties
        }
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* <GlobalBackground /> */}
            <Toaster />
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
