import type { User } from "./types";

export const MOCK_USERS: User[] = [
  { id: "1", name: "Joy", email: "joy@example.com", status: "pending", createdAt: "2025-12-01" },
  { id: "2", name: "Alex", email: "alex@example.com", status: "approved", createdAt: "2025-12-03" },
  { id: "3", name: "Sam", email: "sam@example.com", status: "pending", createdAt: "2025-12-05" },
  { id: "4", name: "Chris", email: "chris@example.com", status: "approved", createdAt: "2025-12-10" },
  { id: "5", name: "Dana", email: "dana@example.com", status: "pending", createdAt: "2025-12-15" },
  { id: "6", name: "Jordan", email: "jordan@example.com", status: "approved", createdAt: "2026-01-02" },
  { id: "7", name: "Morgan", email: "morgan@example.com", status: "pending", createdAt: "2026-01-10" },
  { id: "8", name: "Riley", email: "riley@example.com", status: "approved", createdAt: "2026-01-18" },
  { id: "9", name: "Jamie", email: "jamie@example.com", status: "pending", createdAt: "2026-02-01" },
  { id: "10", name: "Taylor", email: "taylor@example.com", status: "pending", createdAt: "2026-02-14" },
  { id: "11", name: "Casey", email: "casey@example.com", status: "approved", createdAt: "2026-03-01" },
  { id: "12", name: "Avery", email: "avery@example.com", status: "pending", createdAt: "2026-03-20" },
];
