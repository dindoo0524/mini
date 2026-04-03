export type UserStatus = "pending" | "approved";

export type SearchType = "name" | "id";

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: string;
}

/** Fields that can be edited on the detail page */
export interface UserEditableFields {
  name: string;
  email: string;
  status: UserStatus;
}

export type StatusFilterValue = UserStatus | "all";

export interface UserSearchParams {
  status: StatusFilterValue;
  searchType: SearchType;
  keyword: string;
}

export const DEFAULT_SEARCH_PARAMS: UserSearchParams = {
  status: "all",
  searchType: "name",
  keyword: "",
};
