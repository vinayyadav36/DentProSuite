import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SqliteAdapter } from '../src/storage/adapters/SqliteAdapter.js';

describe('SqliteAdapter query capabilities', () => {
  let adapter: SqliteAdapter<any>;

  beforeEach(async () => {
    adapter = new SqliteAdapter('users');
    const items = await adapter.getAll();
    for (const i of items) {
      await adapter.delete(i.id);
    }
  });

  afterEach(async () => {
    const items = await adapter.getAll();
    for (const i of items) {
      await adapter.delete(i.id);
    }
  });

  it('can get by email', async () => {
    await adapter.insert({ id: 'u1', email: 'test1@test.com' });
    await adapter.insert({ id: 'u2', email: 'test2@test.com' });

    const u = await adapter.getByEmail('test2@test.com');
    expect(u).toBeDefined();
    expect(u!.id).toBe('u2');
  });

  it('can filter multiple items with findMany', async () => {
    await adapter.insert({ id: 'a1', status: 'ACTIVE', type: 'X' });
    await adapter.insert({ id: 'a2', status: 'ACTIVE', type: 'Y' });
    await adapter.insert({ id: 'a3', status: 'INACTIVE', type: 'X' });

    const active = await adapter.findMany({ status: 'ACTIVE' });
    expect(active.length).toBe(2);

    const activeX = await adapter.findMany({ status: 'ACTIVE', type: 'X' });
    expect(activeX.length).toBe(1);
    expect(activeX[0].id).toBe('a1');
  });
});
