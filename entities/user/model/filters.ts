import type { User, StatusFilterValue, UserSearchParams } from "./types";

export function filterUsersByStatus(
  users: User[],
  status: StatusFilterValue,
): User[] {
  if (status === "all") return users;
  return users.filter((user) => user.status === status);
}

export function searchUsers(
  users: User[],
  params: UserSearchParams,
): User[] {
  let result = filterUsersByStatus(users, params.status);

  const keyword = params.keyword.trim().toLowerCase();
  if (keyword) {
    result = result.filter((user) => {
      const field = params.searchType === "id" ? user.id : user.name;
      return field.toLowerCase().includes(keyword);
    });
  }

  return result;
}
