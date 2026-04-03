import { describe, it, expect } from "vitest";
import { updateUserStatus } from "../mutations";
import type { User } from "../types";

const USERS: User[] = [
  { id: "1", name: "Joy", email: "joy@test.com", status: "pending", createdAt: "2025-12-01" },
  { id: "2", name: "Alex", email: "alex@test.com", status: "approved", createdAt: "2025-12-03" },
];

describe("updateUserStatus", () => {
  it("updates status of matching user", () => {
    const result = updateUserStatus(USERS, "1", "approved");
    expect(result[0].status).toBe("approved");
    expect(result[1].status).toBe("approved"); // unchanged
  });

  it("does not mutate original array", () => {
    const result = updateUserStatus(USERS, "1", "approved");
    expect(USERS[0].status).toBe("pending");
    expect(result).not.toBe(USERS);
  });

  it("returns unchanged array when id not found", () => {
    const result = updateUserStatus(USERS, "999", "approved");
    expect(result).toEqual(USERS);
  });
});
