"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/entities/user";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}
