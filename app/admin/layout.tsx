import { QueryProvider } from "@/shared/lib/query-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
