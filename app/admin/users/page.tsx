import { Suspense } from "react";
import { UserTable } from "@/widgets/user-table";

export default function AdminUsersPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Suspense>
        <UserTable />
      </Suspense>
    </main>
  );
}
