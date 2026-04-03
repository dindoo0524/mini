import type { UserEditableFields } from "./types";

export interface ValidationErrors {
  name?: string;
  email?: string;
}

export function validateUser(fields: UserEditableFields): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!fields.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!fields.email.trim()) {
    errors.email = "Email is required.";
  } else if (!fields.email.includes("@")) {
    errors.email = "Email must contain @.";
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
