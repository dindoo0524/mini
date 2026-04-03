"use client";

import type { User } from "@/entities/user";
import { Dialog } from "@/shared/ui";
import { useApproveUser } from "../hooks/use-approve-user";

interface ApproveDialogProps {
  user: User | null;
  onClose: () => void;
}

export function ApproveDialog({ user, onClose }: ApproveDialogProps) {
  const { mutate, isPending, error, reset } = useApproveUser();

  const handleConfirm = () => {
    if (!user) return;
    mutate(user.id, {
      onSuccess: () => onClose(),
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={!!user} onClose={handleClose}>
      <h2 className="text-lg font-semibold">Approve User</h2>
      <p className="mt-2 text-sm text-gray-600">
        Are you sure you want to approve <strong>{user.name}</strong>?
      </p>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error.message}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleClose}
          disabled={isPending}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Approving..." : "Approve"}
        </button>
      </div>
    </Dialog>
  );
}
