"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUserStats } from "@/entities/user";

export function useStats() {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: fetchUserStats,
  });
}
