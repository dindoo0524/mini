"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { User, UserSearchParams } from "@/entities/user";
import {
  searchUsers,
  parseUserSearchParams,
  toURLSearchParams,
  DEFAULT_SEARCH_PARAMS,
} from "@/entities/user";
import { UserSearchForm } from "@/features/user-search";
import { ApproveDialog } from "@/features/user-approve";
import { StatusBadge } from "@/shared/ui";
import { useUsers } from "../hooks/use-users";
import { UserTableSkeleton } from "./user-table-skeleton";

export function UserTable() {
  const router = useRouter();
  const rawParams = Object.fromEntries(useSearchParams().entries());
  const initialSearch = parseUserSearchParams(rawParams);

  const { data: users, isLoading, isError } = useUsers();
  const [searchParams, setSearchParams] = useState<UserSearchParams>(initialSearch);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(
    () => searchUsers(users ?? [], searchParams),
    [users, searchParams],
  );

  const syncURL = (params: UserSearchParams) => {
    const qs = toURLSearchParams(params);
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  const handleSearch = (params: UserSearchParams) => {
    setSearchParams(params);
    syncURL(params);
  };

  const handleReset = () => {
    setSearchParams(DEFAULT_SEARCH_PARAMS);
    syncURL(DEFAULT_SEARCH_PARAMS);
  };

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
        Failed to load users. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">User Management</h1>
        <button
          type="button"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + Add User
        </button>
      </div>

      <UserSearchForm
        initialValues={searchParams}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Total <strong className="text-gray-900">{filteredUsers.length}</strong> users
        </span>
      </div>

      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 font-medium text-gray-600">Created</th>
                <th className="px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{user.id}</td>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        disabled={user.status === "approved"}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                      >
                        {user.status === "approved" ? "Approved" : "Approve"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ApproveDialog
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
