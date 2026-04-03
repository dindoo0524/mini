"use client";

import Link from "next/link";
import { useStats } from "../hooks/use-stats";
import { StatCard } from "./stat-card";
import { RecentSignups } from "./recent-signups";

export function Dashboard() {
  const { data: stats, isLoading, isError } = useStats();

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
        Failed to load dashboard. Please refresh the page.
      </div>
    );
  }

  if (isLoading || !stats) {
    return <DashboardSkeleton />;
  }

  const approvalRate = stats.total > 0
    ? Math.round((stats.approved / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/admin/users"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Manage Users →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.total}
          description="All registered users"
          icon="👥"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          description="Awaiting approval"
          icon="⏳"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          description="Active users"
          icon="✅"
        />
        <StatCard
          title="Approval Rate"
          value={approvalRate}
          description={`${approvalRate}% of users approved`}
          icon="📊"
        />
      </div>

      <RecentSignups users={stats.recentSignups} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
