"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { approveUser } from "@/entities/user";

export function useApproveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => approveUser(userId),
    onSuccess: (updatedUsers) => {
      queryClient.setQueryData(["users"], updatedUsers);
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      toast.success("User approved successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
