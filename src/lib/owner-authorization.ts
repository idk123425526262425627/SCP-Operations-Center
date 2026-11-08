
import "server-only";

import authorizationConfig from "@/app/OwnerTools/Authorization.json";

export type OwnerAuthorization = {
  email: string;
  class: string;
  title: string;
  permissions: string[];
  enabled: boolean;
};

const authorizedUsers =
  authorizationConfig.authorizedUsers as OwnerAuthorization[];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Finds the authorization entry for a verified account.
 * Duplicate email entries fail closed rather than choosing one.
 */
export function getOwnerAuthorization(
  email: string,
  emailVerified: boolean,
): OwnerAuthorization | null {
  if (!emailVerified || !email) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);

  const matches = authorizedUsers.filter(
    (user) =>
      normalizeEmail(user.email) === normalizedEmail,
  );

  if (matches.length !== 1) {
    return null;
  }

  const authorization = matches[0];

  if (
    !authorization.enabled ||
    !Array.isArray(authorization.permissions) ||
    typeof authorization.class !== "string"
  ) {
    return null;
  }

  return authorization;
}

/**
 * Checks whether an authorized user has a specific permission.
 */
export function hasOwnerPermission(
  authorization: OwnerAuthorization | null,
  permission: string,
): boolean {
  if (!authorization || !authorization.enabled) {
    return false;
  }

  return (
    authorization.permissions.includes("*") ||
    authorization.permissions.includes(permission)
  );
}
