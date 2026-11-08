
import { auth } from "@/lib/auth";
import {
  getOwnerAuthorization,
  hasOwnerPermission,
} from "@/lib/owner-authorization";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentSession(
  requestHeaders?: Headers,
) {
  const currentHeaders =
    requestHeaders ?? (await headers());

  return auth.api.getSession({
    headers: currentHeaders,
  });
}

export async function getCurrentAuthorization(
  requestHeaders?: Headers,
) {
  const session = await getCurrentSession(requestHeaders);

  if (!session) {
    return null;
  }

  const authorization = getOwnerAuthorization(
    session.user.email,
    session.user.emailVerified,
  );

  if (!authorization) {
    return null;
  }

  return {
    session,
    authorization,
  };
}

export async function hasPermission(
  permission: string,
  requestHeaders?: Headers,
): Promise<boolean> {
  const result = await getCurrentAuthorization(requestHeaders);

  if (!result) {
    return false;
  }

  return hasOwnerPermission(
    result.authorization,
    permission,
  );
}

export async function getAdministratorSession(
  requestHeaders?: Headers,
) {
  const result = await getCurrentAuthorization(requestHeaders);

  if (
    !result ||
    !hasOwnerPermission(
      result.authorization,
      "MANAGE_PERSONNEL",
    )
  ) {
    return null;
  }

  return result.session;
}

export async function requireAdministrator() {
  const result = await getCurrentAuthorization();

  if (!result) {
    redirect("/sign-in");
  }

  if (
    !hasOwnerPermission(
      result.authorization,
      "MANAGE_PERSONNEL",
    )
  ) {
    redirect("/dashboard");
  }

  return result.session;
}
