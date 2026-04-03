import { use } from "react";
import { UserDetail } from "@/widgets/user-detail";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <UserDetail userId={id} />
    </main>
  );
}
