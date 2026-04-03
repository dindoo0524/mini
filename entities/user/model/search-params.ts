import type { UserSearchParams, StatusFilterValue, SearchType } from "./types";
import { DEFAULT_SEARCH_PARAMS } from "./types";

const VALID_STATUSES: StatusFilterValue[] = ["all", "pending", "approved"];
const VALID_SEARCH_TYPES: SearchType[] = ["name", "id"];

export function parseUserSearchParams(
  raw: Record<string, string | string[] | undefined>,
): UserSearchParams {
  const status = VALID_STATUSES.includes(raw.status as StatusFilterValue)
    ? (raw.status as StatusFilterValue)
    : DEFAULT_SEARCH_PARAMS.status;

  const searchType = VALID_SEARCH_TYPES.includes(raw.searchType as SearchType)
    ? (raw.searchType as SearchType)
    : DEFAULT_SEARCH_PARAMS.searchType;

  const keyword = typeof raw.keyword === "string" ? raw.keyword : DEFAULT_SEARCH_PARAMS.keyword;

  return { status, searchType, keyword };
}

export function toURLSearchParams(params: UserSearchParams): string {
  const entries: [string, string][] = [];

  if (params.status !== DEFAULT_SEARCH_PARAMS.status) {
    entries.push(["status", params.status]);
  }
  if (params.searchType !== DEFAULT_SEARCH_PARAMS.searchType) {
    entries.push(["searchType", params.searchType]);
  }
  if (params.keyword.trim()) {
    entries.push(["keyword", params.keyword.trim()]);
  }

  return new URLSearchParams(entries).toString();
}
