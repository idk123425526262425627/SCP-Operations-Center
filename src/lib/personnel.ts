
import "server-only";

import { Pool } from "pg";
import { getOwnerAuthorization } from "@/lib/owner-authorization";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED;

if (!databaseUrl) {
  throw new Error("DATABASE_URL_UNPOOLED is missing.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 5,
});

export type PersonnelProfile = {
  id: number;
  personnelNumber: string | null;
  displayName: string | null;
  status: string;
  foundationClass: string | null;
  foundationTitle: string | null;
  authorityClassification: string | null;
  securityClearance: string | null;
  departmentId: number | null;
  rankId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function ensurePersonnelProfile(
  authUserId: string,
  displayName?: string | null,
  email?: string | null,
  emailVerified = false,
): Promise<PersonnelProfile> {
  const authorization = email
    ? getOwnerAuthorization(email, emailVerified)
    : null;

  const foundationClass = authorization?.class ?? null;
  const foundationTitle = authorization?.title ?? null;

  const profileDisplayName = foundationTitle ?? displayName ?? null;

  const result = await pool.query<PersonnelProfile>(
    `
    INSERT INTO "public"."Personnel" (
      "authUserId",
      "displayName",
      "status",
      "foundationClass",
      "foundationTitle",
      "authorityClassification",
      "securityClearance",
      "isSystemProtected",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      $1,
      $2,
      'ACTIVE',
      $3,
      $4,
      NULL,
      NULL,
      false,
      NOW(),
      NOW()
    )
    ON CONFLICT ("authUserId")
    DO UPDATE SET
      "foundationClass" = CASE
        WHEN EXCLUDED."foundationClass" IS NOT NULL
          THEN EXCLUDED."foundationClass"
        ELSE "Personnel"."foundationClass"
      END,
      "foundationTitle" = CASE
        WHEN EXCLUDED."foundationTitle" IS NOT NULL
          THEN EXCLUDED."foundationTitle"
        ELSE "Personnel"."foundationTitle"
      END,
      "displayName" = CASE
        WHEN EXCLUDED."foundationTitle" IS NOT NULL
          THEN EXCLUDED."foundationTitle"
        ELSE "Personnel"."displayName"
      END,
      "updatedAt" = NOW()
    RETURNING
      "id",
      "personnelNumber",
      "displayName",
      "status",
      "foundationClass",
      "foundationTitle",
      "authorityClassification",
      "securityClearance",
      "departmentId",
      "rankId",
      "createdAt",
      "updatedAt"
    `,
    [
      authUserId,
      profileDisplayName,
      foundationClass,
      foundationTitle,
    ],
  );

  return result.rows[0];
}
