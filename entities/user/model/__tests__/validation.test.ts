import { describe, it, expect } from "vitest";
import { validateUser, hasErrors } from "../validation";
import type { UserEditableFields } from "../types";

const VALID_FIELDS: UserEditableFields = {
  name: "Joy",
  email: "joy@test.com",
  status: "pending",
};

describe("validateUser", () => {
  it("returns no errors for valid input", () => {
    expect(validateUser(VALID_FIELDS)).toEqual({});
  });

  it("returns name error when empty", () => {
    const errors = validateUser({ ...VALID_FIELDS, name: "" });
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeUndefined();
  });

  it("returns name error when whitespace only", () => {
    const errors = validateUser({ ...VALID_FIELDS, name: "   " });
    expect(errors.name).toBeDefined();
  });

  it("returns email error when empty", () => {
    const errors = validateUser({ ...VALID_FIELDS, email: "" });
    expect(errors.email).toBeDefined();
  });

  it("returns email error when missing @", () => {
    const errors = validateUser({ ...VALID_FIELDS, email: "invalid" });
    expect(errors.email).toContain("@");
  });

  it("passes email with @ present", () => {
    const errors = validateUser({ ...VALID_FIELDS, email: "a@b" });
    expect(errors.email).toBeUndefined();
  });

  it("returns both errors when both invalid", () => {
    const errors = validateUser({ ...VALID_FIELDS, name: "", email: "" });
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
  });
});

describe("hasErrors", () => {
  it("returns false for empty object", () => {
    expect(hasErrors({})).toBe(false);
  });

  it("returns true when errors exist", () => {
    expect(hasErrors({ name: "required" })).toBe(true);
  });
});
