
import { auth } from "@/lib/auth";
import { ensurePersonnelProfile } from "@/lib/personnel";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export const instant = false;

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const personnel = await ensurePersonnelProfile(
    session.user.id,
    session.user.name,
    session.user.email,
    session.user.emailVerified,
  );

  return (
    <DashboardClient
      userName={session.user.name}
      userEmail={session.user.email}
      userRole={session.user.role ?? "user"}
      personnelProfile={{
        personnelNumber: personnel.personnelNumber ?? null,
        status: personnel.status,
        foundationClass: personnel.foundationClass,
        foundationTitle: personnel.foundationTitle,
        authorityClassification: personnel.authorityClassification,
        securityClearance: personnel.securityClearance,
      }}
    />
  );
}
