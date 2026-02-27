import AppShell from "@/components/app-shell";

export default function AppRoutesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
