import { describe, it, expect, vi } from "vitest";

// Eliminate async delay in tests
vi.mock("timers-promises", () => ({}));
const originalSetTimeout = globalThis.setTimeout;
vi.stubGlobal("setTimeout", (fn: () => void) => { fn(); return 0; });

const { fetchUsers, fetchUserById, approveUser, updateUser } = await import("../user-api");

vi.mock("../../model/mock", () => ({
  MOCK_USERS: [
    { id: "1", name: "Joy", email: "joy@test.com", status: "pending", createdAt: "2025-12-01" },
    { id: "2", name: "Alex", email: "alex@test.com", status: "approved", createdAt: "2025-12-03" },
  ],
}));

describe("fetchUsers", () => {
  it("returns all users", async () => {
    const users = await fetchUsers();
    expect(users.length).toBeGreaterThanOrEqual(2);
  });

  it("returns a copy (not reference)", async () => {
    const a = await fetchUsers();
    const b = await fetchUsers();
    expect(a).not.toBe(b);
  });
});

describe("fetchUserById", () => {
  it("returns user when found", async () => {
    const user = await fetchUserById("1");
    expect(user).not.toBeNull();
    expect(user!.name).toBe("Joy");
  });

  it("returns null when not found", async () => {
    const user = await fetchUserById("999");
    expect(user).toBeNull();
  });
});

describe("approveUser", () => {
  it("approves a pending user (with forced success)", async () => {
    // Force Math.random to return > 0.2 so it always succeeds
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const users = await approveUser("1");
    const approved = users.find((u) => u.id === "1");
    expect(approved?.status).toBe("approved");

    vi.restoreAllMocks();
  });

  it("throws on simulated failure", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1); // < 0.2 triggers error

    await expect(approveUser("1")).rejects.toThrow("Failed to approve");

    vi.restoreAllMocks();
  });
});

describe("updateUser", () => {
  it("updates user fields (with forced success)", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const updated = await updateUser("1", {
      name: "Joy Updated",
      email: "joy-new@test.com",
      status: "approved",
    });

    expect(updated.name).toBe("Joy Updated");
    expect(updated.email).toBe("joy-new@test.com");
    expect(updated.status).toBe("approved");

    vi.restoreAllMocks();
  });

  it("throws on simulated failure", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);

    await expect(
      updateUser("1", { name: "X", email: "x@t.com", status: "pending" }),
    ).rejects.toThrow("Failed to save");

    vi.restoreAllMocks();
  });
});
