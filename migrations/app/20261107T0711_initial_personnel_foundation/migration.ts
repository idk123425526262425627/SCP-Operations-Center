#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/d8bc7a3c589039b6d6bf5d1730601f56ddf063e15b54feea4ab7fc1314f9f827/contract';
import endContract from '../../snapshots/d8bc7a3c589039b6d6bf5d1730601f56ddf063e15b54feea4ab7fc1314f9f827/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Department',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Permission',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Personnel',
        columns: [
          col('authUserId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('classification', 'text', {
            notNull: true,
            default: lit('CLASS_D'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('clearance', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('departmentId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('displayName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('firstSeenAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isSystemProtected', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('lastSeenAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('personnelNumber', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('rankId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('robloxUserId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('robloxUsername', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('welcomeMessageSentAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'PersonnelHistory',
        columns: [
          col('actorAuthUserId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('eventType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('newValue', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('personnelId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('previousValue', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'PersonnelPermissionGrant',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('grantedByAuthUserId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('permissionId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('personnelId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'PersonnelRecord',
        columns: [
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('createdByAuthUserId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isArchived', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('lastEditedByAuthUserId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('minimumEditClearance', 'int4', {
            notNull: true,
            default: lit(4),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('minimumViewClearance', 'int4', {
            notNull: true,
            default: lit(2),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('personnelId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('recordType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Rank',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('departmentId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('requiredClearance', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Department',
        constraint: 'Department_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Department',
        constraint: 'Department_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Permission',
        constraint: 'Permission_key_key',
        columns: ['key'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Personnel',
        constraint: 'Personnel_authUserId_key',
        columns: ['authUserId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Personnel',
        constraint: 'Personnel_robloxUserId_key',
        columns: ['robloxUserId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Personnel',
        constraint: 'Personnel_personnelNumber_key',
        columns: ['personnelNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'PersonnelPermissionGrant',
        constraint: 'PersonnelPermissionGrant_personnelId_permissionId_key',
        columns: ['personnelId', 'permissionId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Rank',
        constraint: 'Rank_code_key',
        columns: ['code'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Personnel',
        index: 'Personnel_clearance_idx_fbfe5df6',
        columns: ['clearance'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Personnel',
        index: 'Personnel_departmentId_idx_8e261ed8',
        columns: ['departmentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Personnel',
        index: 'Personnel_rankId_idx_b0bc323c',
        columns: ['rankId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Personnel',
        index: 'Personnel_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PersonnelHistory',
        index: 'PersonnelHistory_eventType_idx_e4cf7742',
        columns: ['eventType'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PersonnelHistory',
        index: 'PersonnelHistory_personnelId_idx_3649ff23',
        columns: ['personnelId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PersonnelPermissionGrant',
        index: 'PersonnelPermissionGrant_permissionId_idx_f46fcdf5',
        columns: ['permissionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PersonnelPermissionGrant',
        index: 'PersonnelPermissionGrant_personnelId_idx_3649ff23',
        columns: ['personnelId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PersonnelRecord',
        index: 'PersonnelRecord_personnelId_idx_3649ff23',
        columns: ['personnelId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PersonnelRecord',
        index: 'PersonnelRecord_recordType_idx_38efc843',
        columns: ['recordType'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Rank',
        index: 'Rank_departmentId_idx_8e261ed8',
        columns: ['departmentId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Personnel',
        foreignKey: {
          name: 'Personnel_departmentId_fkey',
          columns: ['departmentId'],
          references: { schema: 'public', table: 'Department', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Personnel',
        foreignKey: {
          name: 'Personnel_rankId_fkey',
          columns: ['rankId'],
          references: { schema: 'public', table: 'Rank', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'PersonnelHistory',
        foreignKey: {
          name: 'PersonnelHistory_personnelId_fkey',
          columns: ['personnelId'],
          references: { schema: 'public', table: 'Personnel', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'PersonnelPermissionGrant',
        foreignKey: {
          name: 'PersonnelPermissionGrant_personnelId_fkey',
          columns: ['personnelId'],
          references: { schema: 'public', table: 'Personnel', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'PersonnelPermissionGrant',
        foreignKey: {
          name: 'PersonnelPermissionGrant_permissionId_fkey',
          columns: ['permissionId'],
          references: { schema: 'public', table: 'Permission', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'PersonnelRecord',
        foreignKey: {
          name: 'PersonnelRecord_personnelId_fkey',
          columns: ['personnelId'],
          references: { schema: 'public', table: 'Personnel', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Rank',
        foreignKey: {
          name: 'Rank_departmentId_fkey',
          columns: ['departmentId'],
          references: { schema: 'public', table: 'Department', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
