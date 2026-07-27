import type { Metadata } from "next";
import { AdminAuthProvider } from "@/components/admin/admin-auth-provider";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  // Panel arama sonuçlarında görünmemeli.
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
