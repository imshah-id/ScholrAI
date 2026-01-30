import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import AuthGuard from "@/components/dashboard/AuthGuard";
import { ShortlistProvider } from "@/components/dashboard/ShortlistContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ShortlistProvider>
        <div className="min-h-screen bg-navy-950 text-white flex">
          <Sidebar />
          <MobileHeader />
          <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 pb-20 md:pb-8 overflow-y-auto w-full">
            {children}
          </main>
          <MobileNav />
        </div>
      </ShortlistProvider>
    </AuthGuard>
  );
}
