
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type ThemeName = "foundation" | "silver" | "dark";

type PersonnelProfile = {
  personnelNumber: string | null;
  status: string;
  foundationClass: string | null;
  foundationTitle: string | null;
  authorityClassification: string | null;
  securityClearance: string | null;
};

type PersonnelRecord = {
  id: number;
  personnelNumber: string | null;
  displayName: string | null;
  robloxUsername: string | null;
  authorityClassification: string | null;
  securityClearance: string | null;
  status: string;
  foundationClass?: string | null;
  foundationTitle?: string | null;
  departmentId: number | null;
  departmentName: string | null;
  rankId: number | null;
  rankName: string | null;
  createdAt: string;
  updatedAt: string;
};

type RegistryResponse = {
  personnel: PersonnelRecord[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

const PAGE_SIZE = 25;

const themes = {
  foundation: {
    name: "Foundation",
    top: "#25292c",
    topSoft: "#303639",
    accent: "#963f46",
    accentHover: "#ad5057",
    background: "#e9e8e4",
    panel: "#f5f4f0",
    surface: "#ffffff",
    border: "#d0cec8",
    text: "#303538",
    muted: "#777b7d",
    toolbar: "#e1dfda",
    success: "#52765d",
  },
  silver: {
    name: "Classic Silver",
    top: "#34485a",
    topSoft: "#455d72",
    accent: "#496783",
    accentHover: "#5b7b99",
    background: "#e3e7eb",
    panel: "#f2f4f6",
    surface: "#ffffff",
    border: "#c4ccd3",
    text: "#293746",
    muted: "#71808d",
    toolbar: "#dce2e8",
    success: "#52765d",
  },
  dark: {
    name: "Dark Records",
    top: "#171b1e",
    topSoft: "#242a2e",
    accent: "#a34b50",
    accentHover: "#bd5d63",
    background: "#1d2225",
    panel: "#282e32",
    surface: "#30373b",
    border: "#485156",
    text: "#e6e6e2",
    muted: "#a5abad",
    toolbar: "#252b2f",
    success: "#7da587",
  },
};

const adminNavigation = [
  { name: "Overview", code: "OV", group: "GENERAL" },
  { name: "Personnel", code: "PR", group: "GENERAL" },
  { name: "Departments", code: "DP", group: "ORGANIZATION" },
  { name: "Announcements", code: "AN", group: "OPERATIONS" },
  { name: "Ranks & Positions", code: "RK", group: "ORGANIZATION" },
  { name: "Whitelists", code: "WL", group: "ACCESS CONTROL" },
  { name: "Incident Reports", code: "IR", group: "OPERATIONS" },
  { name: "Activity Logs", code: "AL", group: "RECORDS" },
];

const personnelNavigation = [
  { name: "Overview", code: "OV", group: "GENERAL" },
  { name: "My Personnel File", code: "PF", group: "GENERAL" },
];

const records = [
  {
    id: "PER-00001",
    name: "Personnel Registry",
    category: "PERSONNEL",
    description: "Central personnel identification and records",
  },
  {
    id: "DEP-00001",
    name: "Department Directory",
    category: "ORGANIZATION",
    description: "Foundation departments and assignments",
  },
  {
    id: "ANN-00001",
    name: "Communications Register",
    category: "COMMUNICATIONS",
    description: "Official Foundation announcements",
  },
  {
    id: "ACL-00001",
    name: "Access Authorization",
    category: "ACCESS CONTROL",
    description: "Personnel permissions and authorization",
  },
  {
    id: "AUD-00001",
    name: "Administrative Audit Log",
    category: "RECORDS",
    description: "Administrative activity and system history",
  },
];

function formatDate(value: string) {
  if (!value) return "NOT AVAILABLE";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "NOT AVAILABLE";

  return date.toLocaleString();
}

function initials(value: string | null | undefined) {
  if (!value) return "UP";

  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function DashboardClient({
  userName,
  userEmail,
  userRole,
  personnelProfile,
}: {
  userName: string;
  userEmail: string;
  userRole: string;
  personnelProfile: PersonnelProfile | null;
}) {
  const router = useRouter();

  const isAdmin = userRole === "admin";
  const navigation = isAdmin ? adminNavigation : personnelNavigation;

  const [themeName, setThemeName] = useState<ThemeName>("foundation");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [activePage, setActivePage] = useState("Overview");
  const [showSystemInfo, setShowSystemInfo] = useState(true);

  const [personnel, setPersonnel] = useState<PersonnelRecord[]>([]);
  const [registryTotal, setRegistryTotal] = useState(0);
  const [registryOffset, setRegistryOffset] = useState(0);
  const [registryHasMore, setRegistryHasMore] = useState(false);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryError, setRegistryError] = useState("");
  const [registryRefresh, setRegistryRefresh] = useState(0);

  const [search, setSearch] = useState("");
  const [authorityClassificationFilter, setAuthorityClassificationFilter] =
    useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [securityClearanceFilter, setSecurityClearanceFilter] = useState("");

  const [selectedPersonnel, setSelectedPersonnel] =
    useState<PersonnelRecord | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("scp-preferences");

    if (!saved) return;

    try {
      const preferences = JSON.parse(saved);

      if (
        preferences.theme === "foundation" ||
        preferences.theme === "silver" ||
        preferences.theme === "dark"
      ) {
        setThemeName(preferences.theme);
      }

      setCompact(!!preferences.compact);
      setShowSystemInfo(preferences.showSystemInfo !== false);
    } catch {
      // Ignore invalid preferences.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "scp-preferences",
      JSON.stringify({
        theme: themeName,
        compact,
        showSystemInfo,
      }),
    );
  }, [themeName, compact, showSystemInfo]);

  useEffect(() => {
    if (!isAdmin || activePage !== "Personnel") return;

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setRegistryLoading(true);
      setRegistryError("");

      try {
        const params = new URLSearchParams({
          search,
          limit: String(PAGE_SIZE),
          offset: String(registryOffset),
        });

        if (authorityClassificationFilter) {
          params.set(
            "authorityClassification",
            authorityClassificationFilter,
          );
        }

        if (statusFilter) {
          params.set("status", statusFilter);
        }

        if (securityClearanceFilter) {
          params.set("securityClearance", securityClearanceFilter);
        }

        const response = await fetch(
          `/api/admin/personnel?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ?? "Unable to load the personnel registry.",
          );
        }

        const result = data as RegistryResponse;

        setPersonnel(result.personnel);
        setRegistryTotal(result.pagination.total);
        setRegistryOffset(result.pagination.offset);
        setRegistryHasMore(result.pagination.hasMore);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setRegistryError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        );

        setPersonnel([]);
        setRegistryTotal(0);
        setRegistryHasMore(false);
      } finally {
        if (!controller.signal.aborted) {
          setRegistryLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    isAdmin,
    activePage,
    search,
    authorityClassificationFilter,
    statusFilter,
    securityClearanceFilter,
    registryOffset,
    registryRefresh,
  ]);

  const t = themes[themeName];
  const rowSpacing = compact ? "py-2" : "py-3.5";

  async function signOut() {
    await authClient.signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  function resetRegistryFilters() {
    setSearch("");
    setAuthorityClassificationFilter("");
    setStatusFilter("");
    setSecurityClearanceFilter("");
    setRegistryOffset(0);
  }

  function refreshRegistry() {
    setRegistryOffset(0);
    setRegistryRefresh((value) => value + 1);
  }

  function changePage(page: string) {
    setActivePage(page);
    setSelectedPersonnel(null);
    setAccountOpen(false);
  }

  const panelStyle = {
    background: t.panel,
    borderColor: t.border,
  };

  const inputStyle = {
    background: t.surface,
    borderColor: t.border,
    color: t.text,
  };

  function SectionHeader({
    eyebrow,
    title,
    description,
    action,
  }: {
    eyebrow: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
  }) {
    return (
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div
            className="mb-2 text-[9px] font-bold tracking-[0.2em]"
            style={{ color: t.accent }}
          >
            {eyebrow}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1.5 text-xs" style={{ color: t.muted }}>
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
    );
  }

  function SmallLabel({ children }: { children: React.ReactNode }) {
    return (
      <div
        className="text-[9px] font-bold tracking-[0.13em]"
        style={{ color: t.muted }}
      >
        {children}
      </div>
    );
  }

  function StatusLabel({ value }: { value: string }) {
    const active = value === "ACTIVE";

    return (
      <span
        className="inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] font-bold tracking-wide"
        style={{
          background: t.toolbar,
          borderColor: t.border,
          color: active ? t.success : t.muted,
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: active ? t.success : t.muted }}
        />
        {value}
      </span>
    );
  }

  function renderPersonnelProfile() {
    if (!personnelProfile) {
      return (
        <section className="border p-6" style={panelStyle}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border text-lg"
              style={{
                background: t.toolbar,
                borderColor: t.border,
                color: t.accent,
              }}
            >
              !
            </div>
            <div>
              <h3 className="text-sm font-bold">
                Personnel Profile Unavailable
              </h3>
              <p className="mt-1 text-xs" style={{ color: t.muted }}>
                Your account is active, but no linked personnel profile was
                found.
              </p>
            </div>
          </div>
        </section>
      );
    }

    const fields = [
      ["FOUNDATION CLASS", personnelProfile.foundationClass ?? "NOT ASSIGNED"],
      ["FOUNDATION TITLE", personnelProfile.foundationTitle ?? "NOT ASSIGNED"],
      ["PERSONNEL NUMBER", personnelProfile.personnelNumber ?? "NOT ASSIGNED"],
      [
        "AUTHORITY CLASSIFICATION",
        personnelProfile.authorityClassification ?? "NOT ASSIGNED",
      ],
      [
        "SECURITY CLEARANCE",
        personnelProfile.securityClearance ?? "NOT ASSIGNED",
      ],
      ["PERSONNEL STATUS", personnelProfile.status],
    ];

    return (
      <section className="overflow-hidden border" style={panelStyle}>
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
          style={{ borderColor: t.border }}
        >
          <div>
            <h3 className="text-sm font-bold">My Personnel File</h3>
            <p className="mt-1 text-[9px] tracking-[0.15em]" style={{ color: t.muted }}>
              PERSONNEL IDENTIFICATION AND CLASSIFICATION
            </p>
          </div>
          <span
            className="border px-2.5 py-1.5 text-[9px] font-bold"
            style={{
              background: t.toolbar,
              borderColor: t.border,
              color: t.accent,
            }}
          >
            AUTHENTICATED RECORD
          </span>
        </div>

        <div
          className="grid gap-px sm:grid-cols-2 lg:grid-cols-3"
          style={{ background: t.border }}
        >
          {fields.map(([label, value]) => (
            <div key={label} className="p-5" style={{ background: t.surface }}>
              <SmallLabel>{label}</SmallLabel>
              <div
                className="mt-2 break-words text-sm font-bold"
                style={{
                  color:
                    label === "FOUNDATION CLASS" ||
                    label === "FOUNDATION TITLE"
                      ? t.accent
                      : t.text,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        <div
          className="border-t px-5 py-3 text-[9px] tracking-wider"
          style={{ borderColor: t.border, color: t.muted }}
        >
          FOUNDATION PERSONNEL DATABASE / READ-ONLY ACCESS
        </div>
      </section>
    );
  }

  function renderPersonnelRegistry() {
    const currentPage = Math.floor(registryOffset / PAGE_SIZE) + 1;
    const totalPages = Math.max(1, Math.ceil(registryTotal / PAGE_SIZE));

    return (
      <section className="overflow-hidden border" style={panelStyle}>
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
          style={{ borderColor: t.border }}
        >
          <div>
            <h3 className="text-sm font-bold">Central Personnel Registry</h3>
            <p className="mt-1 text-[9px] tracking-[0.15em]" style={{ color: t.muted }}>
              LIVE DATABASE RECORDS / PERSONNEL INDEX
            </p>
          </div>

          <button
            onClick={refreshRegistry}
            disabled={registryLoading}
            className="border px-3 py-2 text-[10px] font-bold transition hover:brightness-95 disabled:opacity-50"
            style={inputStyle}
          >
            {registryLoading ? "RETRIEVING..." : "↻  REFRESH RECORDS"}
          </button>
        </div>

        <div
          className="grid gap-3 border-b p-5 md:grid-cols-2 xl:grid-cols-4"
          style={{ borderColor: t.border }}
        >
          <div className="xl:col-span-2">
            <label htmlFor="personnel-search">
              <SmallLabel>SEARCH PERSONNEL</SmallLabel>
            </label>
            <input
              id="personnel-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setRegistryOffset(0);
              }}
              placeholder="Name, personnel number, Roblox username..."
              className="mt-2 w-full border px-3 py-2.5 text-xs outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="authority-classification-filter">
              <SmallLabel>AUTHORITY CLASSIFICATION</SmallLabel>
            </label>
            <select
              id="authority-classification-filter"
              value={authorityClassificationFilter}
              onChange={(event) => {
                setAuthorityClassificationFilter(event.target.value);
                setRegistryOffset(0);
              }}
              className="mt-2 w-full border px-3 py-2.5 text-xs outline-none"
              style={inputStyle}
            >
              <option value="">All classifications</option>
              <option value="HIGHEST">Highest</option>
              <option value="VERY_HIGH">Very High</option>
              <option value="HIGH">High</option>
              <option value="ELEVATED">Elevated</option>
              <option value="STANDARD">Standard</option>
              <option value="LIMITED">Limited</option>
              <option value="NONE">None</option>
            </select>
          </div>

          <div>
            <label htmlFor="status-filter">
              <SmallLabel>PERSONNEL STATUS</SmallLabel>
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setRegistryOffset(0);
              }}
              className="mt-2 w-full border px-3 py-2.5 text-xs outline-none"
              style={inputStyle}
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>

          <div>
            <label htmlFor="security-clearance-filter">
              <SmallLabel>SECURITY CLEARANCE</SmallLabel>
            </label>
            <select
              id="security-clearance-filter"
              value={securityClearanceFilter}
              onChange={(event) => {
                setSecurityClearanceFilter(event.target.value);
                setRegistryOffset(0);
              }}
              className="mt-2 w-full border px-3 py-2.5 text-xs outline-none"
              style={inputStyle}
            >
              <option value="">All clearance levels</option>
              <option value="O5">O5</option>
              <option value="LEVEL_4">Level 4</option>
              <option value="LEVEL_3">Level 3</option>
              <option value="LEVEL_2">Level 2</option>
              <option value="LEVEL_1">Level 1</option>
              <option value="LEVEL_0">Level 0</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetRegistryFilters}
              className="w-full border px-3 py-2.5 text-[10px] font-bold transition hover:brightness-95"
              style={{
                background: t.toolbar,
                borderColor: t.border,
                color: t.text,
              }}
            >
              CLEAR FILTERS
            </button>
          </div>
        </div>

        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3"
          style={{
            background: t.toolbar,
            borderColor: t.border,
          }}
        >
          <span className="text-[9px] font-bold tracking-wider" style={{ color: t.muted }}>
            {registryTotal} PERSONNEL RECORD{registryTotal === 1 ? "" : "S"} FOUND
          </span>
          <span className="text-[9px] font-bold tracking-wider" style={{ color: t.muted }}>
            PAGE {currentPage} OF {totalPages}
          </span>
        </div>

        {registryError && (
          <div
            className="m-4 border p-4 text-xs"
            style={{
              background: t.surface,
              borderColor: t.accent,
              color: t.accent,
            }}
          >
            <div className="font-bold">Unable to load personnel records</div>
            <p className="mt-1">{registryError}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className="border-b text-[9px] font-bold tracking-wider"
                style={{
                  background: t.toolbar,
                  borderColor: t.border,
                  color: t.muted,
                }}
              >
                <th className="whitespace-nowrap px-4 py-3">PERSONNEL NO.</th>
                <th className="whitespace-nowrap px-4 py-3">NAME</th>
                <th className="whitespace-nowrap px-4 py-3">ROBLOX USERNAME</th>
                <th className="whitespace-nowrap px-4 py-3">CLASSIFICATION</th>
                <th className="whitespace-nowrap px-4 py-3">CLEARANCE</th>
                <th className="whitespace-nowrap px-4 py-3">DEPARTMENT</th>
                <th className="whitespace-nowrap px-4 py-3">STATUS</th>
                <th className="whitespace-nowrap px-4 py-3">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {personnel.map((person) => (
                <tr
                  key={person.id}
                  className="border-b text-xs transition hover:brightness-[0.98]"
                  style={{
                    borderColor: t.border,
                    background: t.surface,
                  }}
                >
                  <td
                    className={`whitespace-nowrap px-4 ${rowSpacing} font-bold`}
                    style={{ color: t.accent }}
                  >
                    {person.personnelNumber ?? `UNASSIGNED-${person.id}`}
                  </td>
                  <td className={`whitespace-nowrap px-4 ${rowSpacing} font-semibold`}>
                    {person.displayName ?? "Unnamed Personnel"}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 ${rowSpacing}`}
                    style={{ color: t.muted }}
                  >
                    {person.robloxUsername ?? "NOT LINKED"}
                  </td>
                  <td className={`whitespace-nowrap px-4 ${rowSpacing}`}>
                    {person.authorityClassification ?? "NOT ASSIGNED"}
                  </td>
                  <td className={`whitespace-nowrap px-4 ${rowSpacing}`}>
                    {person.securityClearance ?? "NOT ASSIGNED"}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 ${rowSpacing}`}
                    style={{ color: t.muted }}
                  >
                    {person.departmentName ?? "UNASSIGNED"}
                  </td>
                  <td className={`whitespace-nowrap px-4 ${rowSpacing}`}>
                    <StatusLabel value={person.status} />
                  </td>
                  <td className={`whitespace-nowrap px-4 ${rowSpacing}`}>
                    <button
                      onClick={() => setSelectedPersonnel(person)}
                      className="border px-3 py-1.5 text-[9px] font-bold transition hover:brightness-95"
                      style={{
                        background: t.panel,
                        borderColor: t.border,
                        color: t.text,
                      }}
                    >
                      OPEN FILE
                    </button>
                  </td>
                </tr>
              ))}

              {!registryLoading && personnel.length === 0 && !registryError && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-14 text-center text-xs"
                    style={{ color: t.muted }}
                  >
                    No personnel records match your search or filters.
                  </td>
                </tr>
              )}

              {registryLoading && personnel.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-14 text-center text-xs"
                    style={{ color: t.muted }}
                  >
                    Retrieving records from the Foundation database...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4"
          style={{ borderColor: t.border }}
        >
          <span className="text-[9px] font-bold tracking-wider" style={{ color: t.muted }}>
            DISPLAYING {personnel.length} OF {registryTotal} MATCHING RECORDS
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={registryOffset === 0 || registryLoading}
              onClick={() =>
                setRegistryOffset(Math.max(0, registryOffset - PAGE_SIZE))
              }
              className="border px-3 py-2 text-[9px] font-bold disabled:opacity-40"
              style={inputStyle}
            >
              PREVIOUS
            </button>
            <button
              disabled={!registryHasMore || registryLoading}
              onClick={() => setRegistryOffset(registryOffset + PAGE_SIZE)}
              className="border px-3 py-2 text-[9px] font-bold disabled:opacity-40"
              style={inputStyle}
            >
              NEXT
            </button>
          </div>
        </div>
      </section>
    );
  }

  function renderAdminOverview() {
    return (
      <>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "PERSONNEL REGISTRY",
              value: "LIVE",
              detail: "Database connection available",
              accent: t.success,
            },
            {
              label: "DEPARTMENTS",
              value: "NOT CONFIGURED",
              detail: "Department module pending",
              accent: t.muted,
            },
            {
              label: "COMMUNICATIONS",
              value: "NOT CONFIGURED",
              detail: "Announcement module pending",
              accent: t.muted,
            },
            {
              label: "SYSTEM STATUS",
              value: "ONLINE",
              detail: "Operations Center accessible",
              accent: t.success,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border p-5"
              style={{ background: t.surface, borderColor: t.border }}
            >
              <div className="flex items-center justify-between gap-2">
                <SmallLabel>{item.label}</SmallLabel>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: item.accent }}
                />
              </div>
              <div className="mt-4 text-lg font-bold tracking-tight">
                {item.value}
              </div>
              <div className="mt-1 text-[10px]" style={{ color: t.muted }}>
                {item.detail}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">
          <section className="overflow-hidden border" style={panelStyle}>
            <div
              className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: t.border }}
            >
              <div>
                <h3 className="text-sm font-bold">Foundation Records Index</h3>
                <p className="mt-1 text-[9px] tracking-wider" style={{ color: t.muted }}>
                  CENTRAL ADMINISTRATIVE REGISTER
                </p>
              </div>
              <span
                className="border px-2 py-1 text-[9px] font-bold"
                style={{
                  background: t.toolbar,
                  borderColor: t.border,
                  color: t.muted,
                }}
              >
                INTERNAL
              </span>
            </div>

            <div>
              {records.map((record, index) => (
                <div
                  key={record.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 last:border-b-0"
                  style={{
                    background: t.surface,
                    borderColor: t.border,
                  }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center border text-[10px] font-bold"
                      style={{
                        background: t.toolbar,
                        borderColor: t.border,
                        color: t.accent,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold">{record.name}</div>
                      <div className="mt-1 text-[10px]" style={{ color: t.muted }}>
                        {record.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-[9px] font-bold"
                      style={{ color: t.accent }}
                    >
                      {record.id}
                    </div>
                    <div className="mt-1 text-[8px] tracking-wider" style={{ color: t.muted }}>
                      {record.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-5">
            <section className="border p-5" style={panelStyle}>
              <SmallLabel>ADMINISTRATIVE ACCESS</SmallLabel>
              <div className="mt-3 text-lg font-bold">System Administrator</div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: t.muted }}>
                Your account has administrative access to the Operations
                Center. Available modules depend on your assigned permissions.
              </p>
              <div
                className="mt-4 border-t pt-3 text-[9px] font-bold tracking-wider"
                style={{ borderColor: t.border, color: t.accent }}
              >
                AUTHENTICATED ADMINISTRATIVE SESSION
              </div>
            </section>

            <section className="border p-5" style={panelStyle}>
              <SmallLabel>QUICK ACCESS</SmallLabel>
              <div className="mt-3 space-y-2">
                <button
                  onClick={() => changePage("Personnel")}
                  className="flex w-full items-center justify-between border px-3 py-3 text-left text-xs font-semibold transition hover:brightness-95"
                  style={inputStyle}
                >
                  <span>Open Personnel Registry</span>
                  <span style={{ color: t.accent }}>→</span>
                </button>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="flex w-full items-center justify-between border px-3 py-3 text-left text-xs font-semibold transition hover:brightness-95"
                  style={inputStyle}
                >
                  <span>Application Preferences</span>
                  <span style={{ color: t.accent }}>→</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </>
    );
  }

  function renderPersonnelOverview() {
    return (
      <>
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {[
            [
              "FOUNDATION CLASS",
              personnelProfile?.foundationClass ?? "UNAVAILABLE",
            ],
            [
              "AUTHORITY CLASSIFICATION",
              personnelProfile?.authorityClassification ?? "NOT ASSIGNED",
            ],
            [
              "SECURITY CLEARANCE",
              personnelProfile?.securityClearance ?? "NOT ASSIGNED",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border p-5"
              style={{ background: t.surface, borderColor: t.border }}
            >
              <SmallLabel>{label}</SmallLabel>
              <div className="mt-3 break-words text-sm font-bold">{value}</div>
            </div>
          ))}
        </div>
        {renderPersonnelProfile()}
      </>
    );
  }

  function renderPlaceholder() {
    return (
      <section className="border" style={panelStyle}>
        <div
          className="border-b px-5 py-4"
          style={{ borderColor: t.border }}
        >
          <SmallLabel>MODULE STATUS</SmallLabel>
          <h3 className="mt-2 text-sm font-bold">{activePage}</h3>
        </div>

        <div className="p-8 text-center sm:p-14">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center border text-xl font-bold"
            style={{
              background: t.toolbar,
              borderColor: t.border,
              color: t.accent,
            }}
          >
            {navigation.find((item) => item.name === activePage)?.code ?? "SYS"}
          </div>

          <h3 className="mt-5 text-base font-bold">
            Module Not Yet Configured
          </h3>
          <p
            className="mx-auto mt-2 max-w-md text-xs leading-relaxed"
            style={{ color: t.muted }}
          >
            This section is part of the Operations Center navigation, but its
            functionality has not been implemented yet. Existing system
            records and permissions have not been changed.
          </p>

          <div
            className="mx-auto mt-5 inline-flex border px-3 py-2 text-[9px] font-bold tracking-wider"
            style={{
              background: t.toolbar,
              borderColor: t.border,
              color: t.muted,
            }}
          >
            DEVELOPMENT / MODULE PENDING
          </div>
        </div>
      </section>
    );
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background: t.background,
        color: t.text,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* Main application header */}
      <header
        className="sticky top-0 z-40 border-b-2 shadow-sm"
        style={{
          background: t.top,
          borderColor: t.accent,
        }}
      >
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center border text-xl font-black text-white"
              style={{
                background: t.accent,
                borderColor: "rgba(255,255,255,0.18)",
              }}
            >
              S
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black tracking-[0.13em] text-white">
                SCP OPERATIONS
              </div>
              <div className="mt-1 text-[9px] tracking-[0.2em] text-white/50">
                CONTROL CENTER / INTERNAL SYSTEM
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="hidden text-right md:block">
              <div className="text-[9px] font-bold tracking-[0.15em] text-white/40">
                NETWORK ENVIRONMENT
              </div>
              <div className="mt-1 text-[10px] font-bold tracking-wider text-white/85">
                PRIVATE / INTERNAL
              </div>
            </div>

            <div className="hidden h-8 w-px bg-white/15 md:block" />

            <div className="relative">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-2 border border-white/15 px-2.5 py-2 text-left transition hover:bg-white/5"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center text-[10px] font-black text-white"
                  style={{ background: t.accent }}
                >
                  {initials(userName)}
                </div>
                <div className="hidden min-w-0 sm:block">
                  <div className="max-w-[150px] truncate text-[10px] font-bold text-white">
                    {userName}
                  </div>
                  <div className="mt-0.5 text-[8px] font-bold tracking-wider text-white/50">
                    {isAdmin ? "ADMINISTRATOR" : "PERSONNEL"}
                  </div>
                </div>
                <span className="text-[10px] text-white/60">⌄</span>
              </button>

              {accountOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 border shadow-xl"
                  style={{
                    background: t.panel,
                    borderColor: t.border,
                    color: t.text,
                  }}
                >
                  <div className="border-b p-4" style={{ borderColor: t.border }}>
                    <div className="text-xs font-bold">{userName}</div>
                    <div className="mt-1 break-all text-[10px]" style={{ color: t.muted }}>
                      {userEmail}
                    </div>
                    <div className="mt-3 text-[9px] font-bold tracking-wider" style={{ color: t.accent }}>
                      {isAdmin ? "ADMINISTRATOR ACCOUNT" : "PERSONNEL ACCOUNT"}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAccountOpen(false);
                      setActivePage(isAdmin ? "Overview" : "My Personnel File");
                    }}
                    className="w-full px-4 py-3 text-left text-xs hover:brightness-95"
                  >
                    My account
                  </button>
                  <button
                    onClick={signOut}
                    className="w-full border-t px-4 py-3 text-left text-xs font-bold"
                    style={{
                      borderColor: t.border,
                      color: t.accent,
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top-right application navigation */}
        <div
          className="border-t px-4 md:px-7"
          style={{
            background: t.topSoft,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => changePage(item.name)}
                  className="shrink-0 border-b-2 px-3 py-2 text-[10px] font-bold transition"
                  style={{
                    borderColor:
                      activePage === item.name ? t.accent : "transparent",
                    color:
                      activePage === item.name
                        ? "#ffffff"
                        : "rgba(255,255,255,0.58)",
                    background:
                      activePage === item.name
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="hidden shrink-0 items-center gap-2 py-2 lg:flex">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.success }} />
              <span className="text-[9px] font-bold tracking-wider text-white/55">
                SYSTEM ONLINE
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main workspace */}
      <div className="mx-auto max-w-[1700px] px-4 py-6 md:px-7 md:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div
              className="mb-2 text-[9px] font-bold tracking-[0.2em]"
              style={{ color: t.accent }}
            >
              FOUNDATION RECORDS SYSTEM / {activePage.toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {activePage}
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed" style={{ color: t.muted }}>
              {isAdmin
                ? "Administrative workspace for Foundation personnel, organizational records, and internal operations."
                : "Personnel access terminal and individual Foundation records."}
            </p>
          </div>

          <div
            className="flex items-center gap-2 border px-3 py-2"
            style={{
              background: t.panel,
              borderColor: t.border,
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: t.success }} />
            <span className="text-[9px] font-bold tracking-wider" style={{ color: t.muted }}>
              {isAdmin ? "ADMINISTRATIVE ACCESS" : "PERSONNEL ACCESS"}
            </span>
          </div>
        </div>

        {isAdmin ? (
          <>
            {activePage === "Overview" && renderAdminOverview()}
            {activePage === "Personnel" && (
              <>
                <SectionHeader
                  eyebrow="GENERAL / PERSONNEL RECORDS"
                  title="Personnel Registry"
                  description="Search, review, and inspect registered Foundation personnel."
                />
                {renderPersonnelRegistry()}
              </>
            )}
            {activePage !== "Overview" &&
              activePage !== "Personnel" &&
              renderPlaceholder()}
          </>
        ) : (
          <>
            {activePage === "Overview" && (
              <>
                <SectionHeader
                  eyebrow="PERSONNEL / OVERVIEW"
                  title={`Welcome, ${userName}`}
                  description="Your current Foundation identity and personnel information."
                />
                {renderPersonnelOverview()}
              </>
            )}
            {activePage === "My Personnel File" && (
              <>
                <SectionHeader
                  eyebrow="PERSONNEL / IDENTIFICATION"
                  title="My Personnel File"
                  description="Your assigned Foundation identity and classification details."
                />
                {renderPersonnelProfile()}
              </>
            )}
          </>
        )}

        {showSystemInfo && (
          <section className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="border p-5" style={panelStyle}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold">System Information</h3>
                <span className="text-[9px] font-bold tracking-wider" style={{ color: t.accent }}>
                  SYS / 01
                </span>
              </div>
              <div className="space-y-3 text-[10px]" style={{ color: t.muted }}>
                <div className="flex justify-between gap-3">
                  <span>Application</span>
                  <span style={{ color: t.text }}>SCP Operations Center</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Environment</span>
                  <span style={{ color: t.text }}>Development</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Database</span>
                  <span style={{ color: t.text }}>Neon PostgreSQL</span>
                </div>
              </div>
            </div>

            <div className="border p-5" style={panelStyle}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold">Account Information</h3>
                <span className="text-[9px] font-bold tracking-wider" style={{ color: t.accent }}>
                  ACC / 01
                </span>
              </div>
              <div className="space-y-3 text-[10px]" style={{ color: t.muted }}>
                <div className="flex justify-between gap-3">
                  <span>Account type</span>
                  <span style={{ color: t.text }}>
                    {isAdmin ? "Administrator" : "Personnel"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Personnel profile</span>
                  <span style={{ color: t.text }}>
                    {personnelProfile ? "Linked" : "Unavailable"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Foundation title</span>
                  <span style={{ color: t.text }}>
                    {personnelProfile?.foundationTitle ?? "Not assigned"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Security clearance</span>
                  <span style={{ color: t.text }}>
                    {personnelProfile?.securityClearance ?? "Not assigned"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        <footer
          className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-[9px] tracking-wider"
          style={{ borderColor: t.border, color: t.muted }}
        >
          <span>SCP OPERATIONS CONTROL CENTER</span>
          <span>FOUNDATION INTERNAL ADMINISTRATION / DEVELOPMENT</span>
        </footer>
      </div>

      {/* Personnel identification window */}
      {selectedPersonnel && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPersonnel(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="personnel-file-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border shadow-2xl"
            style={{
              background: t.panel,
              borderColor: t.border,
              color: t.text,
            }}
          >
            <div
              className="flex items-center justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: t.border }}
            >
              <div>
                <div className="text-[9px] font-bold tracking-[0.18em]" style={{ color: t.accent }}>
                  FOUNDATION RECORDS / PERSONNEL
                </div>
                <h2 id="personnel-file-title" className="mt-1 text-sm font-bold">
                  Personnel Identification Record
                </h2>
              </div>
              <button
                onClick={() => setSelectedPersonnel(null)}
                aria-label="Close personnel file"
                className="border px-3 py-2 text-[10px] font-bold"
                style={inputStyle}
              >
                CLOSE
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div
                className="overflow-hidden border"
                style={{
                  background: t.surface,
                  borderColor: t.border,
                }}
              >
                <div
                  className="px-5 py-5 text-white sm:px-7"
                  style={{ background: t.top }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center border border-white/20 text-lg font-black"
                        style={{ background: t.accent }}
                      >
                        S
                      </div>
                      <div>
                        <div className="text-xs font-black tracking-[0.15em]">
                          THE SCP FOUNDATION
                        </div>
                        <div className="mt-1 text-[9px] tracking-[0.16em] text-white/55">
                          PERSONNEL IDENTIFICATION CARD
                        </div>
                      </div>
                    </div>
                    <div className="hidden text-right sm:block">
                      <div className="text-[9px] font-bold tracking-widest text-white/45">
                        DOCUMENT TYPE
                      </div>
                      <div className="mt-1 text-[10px] font-bold">
                        INTERNAL / CLASSIFIED
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 h-[3px]" style={{ background: t.accent }} />
                </div>

                <div className="p-5 sm:p-7">
                  <div className="grid gap-6 sm:grid-cols-[130px_1fr]">
                    <div>
                      <div
                        className="flex aspect-[4/5] max-w-[150px] flex-col items-center justify-center border"
                        style={{
                          background: t.toolbar,
                          borderColor: t.border,
                        }}
                      >
                        <div
                          className="flex h-16 w-16 items-center justify-center border text-xl font-bold"
                          style={{
                            background: t.surface,
                            borderColor: t.border,
                            color: t.accent,
                          }}
                        >
                          {initials(selectedPersonnel.displayName)}
                        </div>
                        <div className="mt-4 text-[9px] font-bold tracking-widest" style={{ color: t.muted }}>
                          PERSONNEL PHOTO
                        </div>
                        <div className="mt-1 text-[8px]" style={{ color: t.muted }}>
                          NOT PROVIDED
                        </div>
                      </div>
                      <div
                        className="mt-2 border px-2 py-2 text-center text-[9px] font-bold tracking-wider"
                        style={{
                          background: t.toolbar,
                          borderColor: t.border,
                        }}
                      >
                        {selectedPersonnel.status}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <SmallLabel>PERSONNEL IDENTIFICATION NUMBER</SmallLabel>
                      <div className="mt-2 break-all text-3xl font-black tracking-wider" style={{ color: t.accent }}>
                        {selectedPersonnel.personnelNumber ??
                          `UNASSIGNED-${selectedPersonnel.id}`}
                      </div>

                      <div className="mt-5 border-t pt-4" style={{ borderColor: t.border }}>
                        <SmallLabel>FULL PERSONNEL NAME</SmallLabel>
                        <div className="mt-2 break-words text-xl font-bold">
                          {selectedPersonnel.displayName ?? "Unnamed Personnel"}
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <div>
                            <SmallLabel>FOUNDATION CLASS</SmallLabel>
                            <div className="mt-2 text-sm font-bold" style={{ color: t.accent }}>
                              {selectedPersonnel.foundationClass ?? "NOT ASSIGNED"}
                            </div>
                          </div>
                          <div>
                            <SmallLabel>FOUNDATION TITLE</SmallLabel>
                            <div className="mt-2 text-sm font-semibold">
                              {selectedPersonnel.foundationTitle ?? "NOT ASSIGNED"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-7 grid overflow-hidden border sm:grid-cols-2"
                    style={{
                      borderColor: t.border,
                      background: t.border,
                      gap: "1px",
                    }}
                  >
                    <div className="p-4" style={{ background: t.toolbar }}>
                      <SmallLabel>AUTHORITY CLASSIFICATION</SmallLabel>
                      <div className="mt-2 text-sm font-bold">
                        {selectedPersonnel.authorityClassification ?? "NOT ASSIGNED"}
                      </div>
                    </div>
                    <div className="p-4" style={{ background: t.toolbar }}>
                      <SmallLabel>SECURITY CLEARANCE</SmallLabel>
                      <div className="mt-2 text-sm font-bold">
                        {selectedPersonnel.securityClearance ?? "NOT ASSIGNED"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-7">
                    <div
                      className="mb-4 flex items-center justify-between border-b pb-2"
                      style={{ borderColor: t.border }}
                    >
                      <h3 className="text-[10px] font-black tracking-[0.15em]">
                        PERSONNEL INFORMATION
                      </h3>
                      <span className="text-[9px] font-bold" style={{ color: t.muted }}>
                        SECTION 01
                      </span>
                    </div>

                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                      {[
                        ["ROBLOX USERNAME", selectedPersonnel.robloxUsername ?? "NOT LINKED"],
                        ["DEPARTMENT", selectedPersonnel.departmentName ?? "UNASSIGNED"],
                        ["RANK / POSITION", selectedPersonnel.rankName ?? "UNASSIGNED"],
                        ["PERSONNEL STATUS", selectedPersonnel.status],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <SmallLabel>{label}</SmallLabel>
                          <div className="mt-2 break-words text-xs font-semibold">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="mt-7 border p-4"
                    style={{
                      background: t.toolbar,
                      borderColor: t.border,
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <SmallLabel>DATABASE RECORD</SmallLabel>
                        <div className="mt-1 text-xs font-bold">
                          #{selectedPersonnel.id}
                        </div>
                      </div>
                      <div className="text-right">
                        <SmallLabel>RECORD STATUS</SmallLabel>
                        <div className="mt-1 text-xs font-bold">
                          DATABASE ENTRY
                        </div>
                      </div>
                    </div>

                    <div
                      className="mt-4 grid gap-3 border-t pt-3 sm:grid-cols-2"
                      style={{ borderColor: t.border }}
                    >
                      <div>
                        <SmallLabel>DATE CREATED</SmallLabel>
                        <div className="mt-1 text-[10px] font-semibold">
                          {formatDate(selectedPersonnel.createdAt)}
                        </div>
                      </div>
                      <div>
                        <SmallLabel>LAST UPDATED</SmallLabel>
                        <div className="mt-1 text-[10px] font-semibold">
                          {formatDate(selectedPersonnel.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-[9px] font-bold tracking-widest text-white"
                  style={{ background: t.top }}
                >
                  <span>SCP FOUNDATION / INTERNAL PERSONNEL RECORD</span>
                  <span className="text-white/50">AUTHORIZED ACCESS ONLY</span>
                </div>
              </div>

              <p className="mt-3 text-center text-[9px]" style={{ color: t.muted }}>
                READ-ONLY RECORD / Personnel changes require authorized administrative access.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Application settings */}
      <div className="fixed bottom-5 right-5 z-50">
        {settingsOpen && (
          <div
            className="mb-3 w-[290px] border shadow-2xl"
            style={{
              background: t.panel,
              borderColor: t.border,
              color: t.text,
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{
                background: t.top,
                borderColor: t.border,
              }}
            >
              <div>
                <div className="text-[10px] font-bold tracking-wider text-white">
                  APPLICATION SETTINGS
                </div>
                <div className="mt-1 text-[8px] tracking-wider text-white/50">
                  LOCAL INTERFACE PREFERENCES
                </div>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                aria-label="Close settings"
                className="px-2 text-sm text-white/70"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 p-4">
              <div>
                <label className="mb-2 block text-[9px] font-bold tracking-wider">
                  APPLICATION THEME
                </label>
                <select
                  value={themeName}
                  onChange={(event) =>
                    setThemeName(event.target.value as ThemeName)
                  }
                  className="w-full border p-2.5 text-xs outline-none"
                  style={inputStyle}
                >
                  <option value="foundation">Foundation</option>
                  <option value="silver">Classic Silver</option>
                  <option value="dark">Dark Records</option>
                </select>
              </div>

              <div className="border-t pt-4" style={{ borderColor: t.border }}>
                <div className="mb-3 text-[9px] font-bold tracking-wider">
                  INTERFACE PREFERENCES
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-3 text-xs">
                  Compact interface
                  <input
                    type="checkbox"
                    checked={compact}
                    onChange={(event) => setCompact(event.target.checked)}
                  />
                </label>

                <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 text-xs">
                  Show system information
                  <input
                    type="checkbox"
                    checked={showSystemInfo}
                    onChange={(event) =>
                      setShowSystemInfo(event.target.checked)
                    }
                  />
                </label>
              </div>

              <div
                className="border-t pt-3 text-[9px]"
                style={{ borderColor: t.border, color: t.muted }}
              >
                Preferences are saved in this browser.
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          aria-label="Open application settings"
          title="Application settings"
          className="ml-auto flex h-12 w-12 items-center justify-center border text-xl text-white shadow-lg transition hover:brightness-110"
          style={{
            background: t.accent,
            borderColor: t.top,
          }}
        >
          ⚙
        </button>
      </div>
    </main>
  );
}
