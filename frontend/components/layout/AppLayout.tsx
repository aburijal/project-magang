import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <Topbar />

      <main className="ml-64 min-h-screen pt-20">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}