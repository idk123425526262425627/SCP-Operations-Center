
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import { ensurePersonnelProfile } from "@/lib/personnel";

const databaseUrl = process.env.DATABASE_URL;
const authSecret = process.env.BETTER_AUTH_SECRET;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing.");
}

if (!authSecret) {
  throw new Error("BETTER_AUTH_SECRET is missing.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 5,
});

export const auth = betterAuth({
  appName: "SCP Operations Center",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: authSecret,

  trustedOrigins: [
    "http://localhost:3000",
    "https://localhost:3000",
    process.env.BETTER_AUTH_URL!,
  ],

  database: {
    dialect: new PostgresDialect({ pool }),
    type: "postgres",
    schemaName: "auth",
  },

  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await ensurePersonnelProfile(
            user.id,
            user.name,
            user.email,
            user.emailVerified,
          );
        },
      },
    },
  },

  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});
