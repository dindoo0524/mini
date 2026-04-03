import type { User, UserEditableFields } from "../model/types";
import { MOCK_USERS } from "../model/mock";
import { updateUserStatus } from "../model/mutations";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** In-memory store that survives across calls (simulates DB) */
let users: User[] = [...MOCK_USERS];

export async function fetchUsers(): Promise<User[]> {
  await delay(600);
  return [...users];
}

export async function fetchUserById(userId: string): Promise<User | null> {
  await delay(400);
  return users.find((u) => u.id === userId) ?? null;
}

export async function approveUser(userId: string): Promise<User[]> {
  await delay(800);

  // Simulate random failure (~20%)
  if (Math.random() < 0.2) {
    throw new Error("Failed to approve user. Please try again.");
  }

  users = updateUserStatus(users, userId, "approved");
  return [...users];
}

export async function updateUser(
  userId: string,
  fields: UserEditableFields,
): Promise<User> {
  await delay(700);

  // Simulate random failure (~20%)
  if (Math.random() < 0.2) {
    throw new Error("Failed to save changes. Please try again.");
  }

  users = users.map((u) =>
    u.id === userId ? { ...u, ...fields } : u,
  );

  const updated = users.find((u) => u.id === userId);
  if (!updated) throw new Error("User not found.");

  return { ...updated };
}
