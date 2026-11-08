#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/9e82b3fe9de3062df41aff9ee0c550935aa105a811030b3472b0054c047cd907/contract';
import startContract from '../../snapshots/9e82b3fe9de3062df41aff9ee0c550935aa105a811030b3472b0054c047cd907/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/d70a99e185b5c84e84284b44368ceef728c43108781f19e472440d9e0f8aac8a/contract';
import endContract from '../../snapshots/d70a99e185b5c84e84284b44368ceef728c43108781f19e472440d9e0f8aac8a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      ...this.renameColumn({
        schema: 'public',
        table: 'Personnel',
        column: 'clearance',
        to: 'securityClearance',
      }),
      ...this.renameColumn({
        schema: 'public',
        table: 'PersonnelRecord',
        column: 'minimumEditClearance',
        to: 'minimumEditSecurityClearance',
      }),
      ...this.renameColumn({
        schema: 'public',
        table: 'PersonnelRecord',
        column: 'minimumViewClearance',
        to: 'minimumViewSecurityClearance',
      }),
      ...this.renameColumn({
        schema: 'public',
        table: 'Rank',
        column: 'requiredClearance',
        to: 'requiredSecurityClearance',
      }),
      this.dropColumn({ schema: 'public', table: 'Personnel', column: 'classification' }),
      this.dropDefault({ schema: 'public', table: 'Personnel', column: 'securityClearance' }),
      this.addColumn({
        schema: 'public',
        table: 'Personnel',
        column: col('authorityClassification', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dropNotNull({ schema: 'public', table: 'Personnel', column: 'securityClearance' }),
      this.alterColumnType({
        schema: 'public',
        table: 'Personnel',
        column: 'securityClearance',
        type: 'text',
        using: 'CASE WHEN "securityClearance" = 0 THEN NULL ELSE "securityClearance"::text END',
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'PersonnelRecord',
        column: 'minimumEditSecurityClearance',
        type: 'text',
        operationClass: 'widening',
      }),
      this.setDefault({
        schema: 'public',
        table: 'PersonnelRecord',
        column: col('minimumEditSecurityClearance', 'text', {
          default: lit('LEVEL_4'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'PersonnelRecord',
        column: 'minimumViewSecurityClearance',
        type: 'text',
        operationClass: 'widening',
      }),
      this.setDefault({
        schema: 'public',
        table: 'PersonnelRecord',
        column: col('minimumViewSecurityClearance', 'text', {
          default: lit('LEVEL_2'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'Rank',
        column: 'requiredSecurityClearance',
        type: 'text',
        operationClass: 'widening',
      }),
      this.setDefault({
        schema: 'public',
        table: 'Rank',
        column: col('requiredSecurityClearance', 'text', {
          default: lit('LEVEL_0'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.createIndex({
        schema: 'public',
        table: 'Personnel',
        index: 'Personnel_authorityClassification_idx_6271eedf',
        columns: ['authorityClassification'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PersonnelRecord',
        index: 'PersonnelRecord_minimumEditSecurityClearance_idx_fdcc343f',
        columns: ['minimumEditSecurityClearance'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PersonnelRecord',
        index: 'PersonnelRecord_minimumViewSecurityClearance_idx_0c5ac5e5',
        columns: ['minimumViewSecurityClearance'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Rank',
        index: 'Rank_requiredSecurityClearance_idx_7809e355',
        columns: ['requiredSecurityClearance'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
