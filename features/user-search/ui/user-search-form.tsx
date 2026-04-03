"use client";

import { useState } from "react";
import type { UserSearchParams, StatusFilterValue, SearchType } from "@/entities/user";
import { DEFAULT_SEARCH_PARAMS } from "@/entities/user";

interface UserSearchFormProps {
  initialValues: UserSearchParams;
  onSearch: (params: UserSearchParams) => void;
  onReset: () => void;
}

const STATUS_OPTIONS: { label: string; value: StatusFilterValue }[] = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
];

const SEARCH_TYPE_OPTIONS: { label: string; value: SearchType }[] = [
  { label: "Name", value: "name" },
  { label: "ID", value: "id" },
];

export function UserSearchForm({ initialValues, onSearch, onReset }: UserSearchFormProps) {
  const [form, setForm] = useState<UserSearchParams>(initialValues);

  const handleSearch = () => {
    onSearch(form);
  };

  const handleReset = () => {
    setForm(DEFAULT_SEARCH_PARAMS);
    onReset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as StatusFilterValue }))}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={form.searchType}
          onChange={(e) => setForm((f) => ({ ...f, searchType: e.target.value as SearchType }))}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          {SEARCH_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={form.keyword}
          onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
          onKeyDown={handleKeyDown}
          placeholder="Search keyword..."
          className="w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />

        <button
          type="button"
          onClick={handleSearch}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
