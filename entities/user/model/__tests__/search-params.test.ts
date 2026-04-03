import { describe, it, expect } from "vitest";
import { parseUserSearchParams, toURLSearchParams } from "../search-params";
import { DEFAULT_SEARCH_PARAMS } from "../types";

describe("parseUserSearchParams", () => {
  it("returns defaults for empty input", () => {
    expect(parseUserSearchParams({})).toEqual(DEFAULT_SEARCH_PARAMS);
  });

  it("parses valid status", () => {
    const result = parseUserSearchParams({ status: "pending" });
    expect(result.status).toBe("pending");
  });

  it("falls back to default for invalid status", () => {
    const result = parseUserSearchParams({ status: "invalid" });
    expect(result.status).toBe("all");
  });

  it("parses valid searchType", () => {
    const result = parseUserSearchParams({ searchType: "id" });
    expect(result.searchType).toBe("id");
  });

  it("falls back to default for invalid searchType", () => {
    const result = parseUserSearchParams({ searchType: "email" });
    expect(result.searchType).toBe("name");
  });

  it("parses keyword string", () => {
    const result = parseUserSearchParams({ keyword: "joy" });
    expect(result.keyword).toBe("joy");
  });

  it("falls back for non-string keyword (array)", () => {
    const result = parseUserSearchParams({ keyword: ["a", "b"] });
    expect(result.keyword).toBe("");
  });

  it("parses all params together", () => {
    const result = parseUserSearchParams({
      status: "approved",
      searchType: "id",
      keyword: "123",
    });
    expect(result).toEqual({
      status: "approved",
      searchType: "id",
      keyword: "123",
    });
  });
});

describe("toURLSearchParams", () => {
  it("returns empty string for default params", () => {
    expect(toURLSearchParams(DEFAULT_SEARCH_PARAMS)).toBe("");
  });

  it("includes only non-default values", () => {
    const qs = toURLSearchParams({
      ...DEFAULT_SEARCH_PARAMS,
      status: "pending",
    });
    expect(qs).toBe("status=pending");
  });

  it("includes keyword", () => {
    const qs = toURLSearchParams({
      ...DEFAULT_SEARCH_PARAMS,
      keyword: "joy",
    });
    expect(qs).toBe("keyword=joy");
  });

  it("trims keyword", () => {
    const qs = toURLSearchParams({
      ...DEFAULT_SEARCH_PARAMS,
      keyword: "  joy  ",
    });
    expect(qs).toBe("keyword=joy");
  });

  it("omits empty keyword", () => {
    const qs = toURLSearchParams({
      ...DEFAULT_SEARCH_PARAMS,
      keyword: "   ",
    });
    expect(qs).toBe("");
  });

  it("combines multiple params", () => {
    const qs = toURLSearchParams({
      status: "approved",
      searchType: "id",
      keyword: "test",
    });
    expect(qs).toContain("status=approved");
    expect(qs).toContain("searchType=id");
    expect(qs).toContain("keyword=test");
  });
});
