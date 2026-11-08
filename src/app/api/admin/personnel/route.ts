
import { NextRequest, NextResponse } from "next/server";
import { getAdministratorSession } from "@/lib/authorization";
import { personnelAdminPool } from "@/lib/personnel-admin-db";

export async function GET(request: NextRequest) {
  const session = await getAdministratorSession(request.headers);

  if (!session) {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 },
    );
  }

  try {
    const params = request.nextUrl.searchParams;

    const search = (params.get("search") ?? "").trim().slice(0, 100);

    const authorityClassification =
      (params.get("authorityClassification") ?? "").trim() || null;

    const status = (params.get("status") ?? "").trim() || null;

    const securityClearance =
      (params.get("securityClearance") ?? "").trim() || null;

    const requestedLimit = Number(params.get("limit") ?? 25);
    const requestedOffset = Number(params.get("offset") ?? 0);

    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), 100)
      : 25;

    const offset = Number.isFinite(requestedOffset)
      ? Math.max(Math.floor(requestedOffset), 0)
      : 0;

    const filters = [
      search,
      authorityClassification,
      status,
      securityClearance,
    ];

    const [personnelResult, countResult] = await Promise.all([
      personnelAdminPool.query(
        `
          SELECT
            p.id,
            p."personnelNumber",
            p."displayName",
            p."foundationClass",
            p."foundationTitle",
            p."authorityClassification",
            p."securityClearance",
            p."robloxUsername",
            p.status,
            p."departmentId",
            d.name AS "departmentName",
            p."rankId",
            r.name AS "rankName",
            p."createdAt",
            p."updatedAt"
          FROM public."Personnel" AS p
          LEFT JOIN public."Department" AS d
            ON d.id = p."departmentId"
          LEFT JOIN public."Rank" AS r
            ON r.id = p."rankId"
          WHERE
            (
              $1 = ''
              OR COALESCE(p."personnelNumber", '') ILIKE '%' || $1 || '%'
              OR COALESCE(p."displayName", '') ILIKE '%' || $1 || '%'
              OR COALESCE(p."robloxUsername", '') ILIKE '%' || $1 || '%'
            )
            AND (
              $2::text IS NULL
              OR p."authorityClassification" = $2
            )
            AND ($3::text IS NULL OR p.status = $3)
            AND (
              $4::text IS NULL
              OR p."securityClearance" = $4
            )
          ORDER BY p."createdAt" DESC, p.id DESC
          LIMIT $5 OFFSET $6
        `,
        [...filters, limit, offset],
      ),

      personnelAdminPool.query(
        `
          SELECT COUNT(*) AS total
          FROM public."Personnel" AS p
          WHERE
            (
              $1 = ''
              OR COALESCE(p."personnelNumber", '') ILIKE '%' || $1 || '%'
              OR COALESCE(p."displayName", '') ILIKE '%' || $1 || '%'
              OR COALESCE(p."robloxUsername", '') ILIKE '%' || $1 || '%'
            )
            AND (
              $2::text IS NULL
              OR p."authorityClassification" = $2
            )
            AND ($3::text IS NULL OR p.status = $3)
            AND (
              $4::text IS NULL
              OR p."securityClearance" = $4
            )
        `,
        filters,
      ),
    ]);

    const total = Number(countResult.rows[0]?.total ?? 0);

    return NextResponse.json({
      personnel: personnelResult.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + personnelResult.rows.length < total,
      },
    });
  } catch (error) {
    console.error("Personnel registry database error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve the personnel registry." },
      { status: 500 },
    );
  }
}
