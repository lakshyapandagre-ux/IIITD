import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexusCollab — Inter-College Engineering Coalitions & Lab Exchange",
  description: "Accredited inter-college engineering consortium for shared lab equipment, complementarity matching, and verifiable multi-sig charters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF9FD] text-slate-800 font-sans antialiased wensity-grid">
        {children}
      </body>
    </html>
  );
}
