"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/shared/ui";
import { UserEditForm } from "@/features/user-edit";
import { useUser } from "../hooks/use-user";

interface UserDetailProps {
  userId: string;
}

export function UserDetail({ userId }: UserDetailProps) {
  const { data: user, isLoading, isError } = useUser(userId);
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
        Failed to load user details.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-gray-200 px-4 py-12 text-center">
        <p className="text-lg font-medium text-gray-900">User Not Found</p>
        <p className="mt-1 text-sm text-gray-500">
          The user you are looking for does not exist.
        </p>
        <Link
          href="/admin/users"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to List
        </Link>
      </div>
    );
  }

  if (isEditing) {
    return (
      <UserEditForm
        user={user}
        onSaved={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">User Detail</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/users"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to List
          </Link>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-lg border border-gray-200">
        <dl className="divide-y divide-gray-200">
          <Row label="ID" value={user.id} />
          <Row label="Name" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="Status">
            <StatusBadge status={user.status} />
          </Row>
          <Row label="Created At" value={user.createdAt} />
        </dl>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex px-4 py-3">
      <dt className="w-32 shrink-0 text-sm font-medium text-gray-500">
        {label}
      </dt>
      <dd className="text-sm text-gray-900">{children ?? value}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-9 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-9 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 p-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex border-b border-gray-100 px-4 py-3 last:border-0">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="ml-8 h-4 w-40 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
