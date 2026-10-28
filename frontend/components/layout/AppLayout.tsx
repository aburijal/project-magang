"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#F4F6F8]">
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <Topbar
        onMenuClick={() => setMobileMenuOpen((open) => !open)}
      />

      <main className="min-h-screen pt-16 sm:pt-20 lg:ml-64">
        <div className="mx-auto w-full max-w-[1800px] p-3 sm:p-5 lg:p-7 xl:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}