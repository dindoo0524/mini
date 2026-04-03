"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, UserEditableFields } from "@/entities/user";
import { updateUser } from "@/entities/user";

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fields: UserEditableFields) => updateUser(userId, fields),
    onSuccess: (updatedUser) => {
      // Update detail cache
      queryClient.setQueryData(["users", userId], updatedUser);

      // Update list cache if present
      queryClient.setQueryData<User[]>(["users"], (old) =>
        old?.map((u) => (u.id === userId ? updatedUser : u)),
      );
    },
  });
}
