import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

const databaseUrl = process.env['DATABASE_URL_UNPOOLED'];

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL_UNPOOLED is missing. Configure your Neon direct connection URL.',
  );
}

export const contract = contractFromJson<Contract>(contractJson);

export const db = postgres({
  contract,
  url: databaseUrl,
});