import { describe, it, expect } from "vitest";
import { filterUsersByStatus, searchUsers } from "../filters";
import type { User, UserSearchParams } from "../types";

const USERS: User[] = [
  { id: "1", name: "Joy", email: "joy@test.com", status: "pending", createdAt: "2025-12-01" },
  { id: "2", name: "Alex", email: "alex@test.com", status: "approved", createdAt: "2025-12-03" },
  { id: "3", name: "Sam", email: "sam@test.com", status: "pending", createdAt: "2025-12-05" },
];

describe("filterUsersByStatus", () => {
  it("returns all users when status is 'all'", () => {
    expect(filterUsersByStatus(USERS, "all")).toEqual(USERS);
  });

  it("filters pending users", () => {
    const result = filterUsersByStatus(USERS, "pending");
    expect(result).toHaveLength(2);
    expect(result.every((u) => u.status === "pending")).toBe(true);
  });

  it("filters approved users", () => {
    const result = filterUsersByStatus(USERS, "approved");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Alex");
  });

  it("returns empty array when no match", () => {
    const users: User[] = [
      { id: "1", name: "Joy", email: "j@t.com", status: "pending", createdAt: "2025-01-01" },
    ];
    expect(filterUsersByStatus(users, "approved")).toEqual([]);
  });

  it("handles empty array", () => {
    expect(filterUsersByStatus([], "pending")).toEqual([]);
  });
});

describe("searchUsers", () => {
  const baseParams: UserSearchParams = {
    status: "all",
    searchType: "name",
    keyword: "",
  };

  it("returns all users with default params", () => {
    expect(searchUsers(USERS, baseParams)).toEqual(USERS);
  });

  it("filters by status + keyword combined", () => {
    const result = searchUsers(USERS, {
      status: "pending",
      searchType: "name",
      keyword: "Joy",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("searches by name (case-insensitive)", () => {
    const result = searchUsers(USERS, { ...baseParams, keyword: "joy" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Joy");
  });

  it("searches by id", () => {
    const result = searchUsers(USERS, {
      ...baseParams,
      searchType: "id",
      keyword: "2",
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Alex");
  });

  it("trims keyword whitespace", () => {
    const result = searchUsers(USERS, { ...baseParams, keyword: "  Sam  " });
    expect(result).toHaveLength(1);
  });

  it("returns empty when keyword matches nothing", () => {
    const result = searchUsers(USERS, { ...baseParams, keyword: "zzz" });
    expect(result).toEqual([]);
  });

  it("ignores empty keyword", () => {
    const result = searchUsers(USERS, { ...baseParams, keyword: "   " });
    expect(result).toEqual(USERS);
  });
});
