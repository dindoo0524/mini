"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveUser } from "@/entities/user";

export function useApproveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => approveUser(userId),
    onSuccess: (updatedUsers) => {
      queryClient.setQueryData(["users"], updatedUsers);
    },
  });
}
