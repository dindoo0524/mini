"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUserById } from "@/entities/user";

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUserById(userId),
  });
}
