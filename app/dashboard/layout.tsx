import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-950 text-white flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
