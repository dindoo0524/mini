"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User, UserEditableFields } from "@/entities/user";
import { updateUser } from "@/entities/user";

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fields: UserEditableFields) => updateUser(userId, fields),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["users", userId], updatedUser);
      queryClient.setQueryData<User[]>(["users"], (old) =>
        old?.map((u) => (u.id === userId ? updatedUser : u)),
      );
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      toast.success("Changes saved successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
