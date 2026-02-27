export default function PublicRoutesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="relative z-10 min-h-screen">{children}</div>;
}
