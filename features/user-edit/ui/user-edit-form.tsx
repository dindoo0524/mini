"use client";

import { useState, useMemo } from "react";
import type { User, UserEditableFields, UserStatus } from "@/entities/user";
import { validateUser, hasErrors } from "@/entities/user";
import type { ValidationErrors } from "@/entities/user";
import { useUpdateUser } from "../hooks/use-update-user";

interface UserEditFormProps {
  user: User;
  onSaved: () => void;
  onCancel: () => void;
}

const STATUS_OPTIONS: { label: string; value: UserStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
];

export function UserEditForm({ user, onSaved, onCancel }: UserEditFormProps) {
  const [form, setForm] = useState<UserEditableFields>({
    name: user.name,
    email: user.email,
    status: user.status,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { mutate, isPending, error } = useUpdateUser(user.id);

  const errors: ValidationErrors = useMemo(() => validateUser(form), [form]);
  const isInvalid = hasErrors(errors);

  const handleChange = (field: keyof UserEditableFields, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleSave = () => {
    if (isInvalid) return;
    mutate(form, { onSuccess: onSaved });
  };

  const showError = (field: keyof ValidationErrors) =>
    touched[field] ? errors[field] : undefined;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Edit User</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || isInvalid}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error.message}
        </div>
      )}

      {/* Form card */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/30">
        <div className="divide-y divide-blue-100">
          {/* Read-only: ID */}
          <FormRow label="ID">
            <span className="text-sm text-gray-500">{user.id}</span>
          </FormRow>

          {/* Editable: Name */}
          <FormRow label="Name" error={showError("name")}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </FormRow>

          {/* Editable: Email */}
          <FormRow label="Email" error={showError("email")}>
            <input
              type="text"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </FormRow>

          {/* Editable: Status */}
          <FormRow label="Status">
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormRow>

          {/* Read-only: Created At */}
          <FormRow label="Created At">
            <span className="text-sm text-gray-500">{user.createdAt}</span>
          </FormRow>
        </div>
      </div>
    </div>
  );
}

function FormRow({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start px-4 py-3">
      <div className="w-32 shrink-0 pt-1.5 text-sm font-medium text-gray-500">
        {label}
      </div>
      <div className="flex-1">
        {children}
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
