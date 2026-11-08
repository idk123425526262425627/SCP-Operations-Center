#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/9e82b3fe9de3062df41aff9ee0c550935aa105a811030b3472b0054c047cd907/contract';
import endContract from '../../snapshots/9e82b3fe9de3062df41aff9ee0c550935aa105a811030b3472b0054c047cd907/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d8bc7a3c589039b6d6bf5d1730601f56ddf063e15b54feea4ab7fc1314f9f827/contract';
import startContract from '../../snapshots/d8bc7a3c589039b6d6bf5d1730601f56ddf063e15b54feea4ab7fc1314f9f827/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Personnel',
        column: col('foundationClass', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Personnel',
        column: col('foundationTitle', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.createIndex({
        schema: 'public',
        table: 'Personnel',
        index: 'Personnel_foundationClass_idx_32a933e2',
        columns: ['foundationClass'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
