import type { User, UserStatus } from "./types";

export function updateUserStatus(
  users: User[],
  userId: string,
  status: UserStatus,
): User[] {
  return users.map((user) =>
    user.id === userId ? { ...user, status } : user,
  );
}
