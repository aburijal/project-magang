import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({
  children,
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100">
      <Sidebar mobileMenuOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <Topbar onMenuClick={() => setMobileMenuOpen((open) => !open)} />

      <main className="min-h-screen pt-16 sm:pt-20 lg:ml-64">
        <div className="p-2.5 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}