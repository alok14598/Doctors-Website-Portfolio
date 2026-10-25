import { describe, expect, it } from 'vitest';
import { prisma } from '@/server/db';
import * as repo from './admin.repository';

const createAdmin = () =>
  prisma.adminUser.create({
    data: {
      email: 'staff@example.com',
      name: 'Clinic Staff',
      passwordHash: 'not-a-real-hash',
      role: 'STAFF',
    },
  });

describe('findByEmail', () => {
  it('finds a staff account regardless of the casing typed at sign-in', async () => {
    await createAdmin();

    const found = await repo.findByEmail('STAFF@Example.com');

    expect(found?.name).toBe('Clinic Staff');
  });

  it('returns null for an unknown email rather than throwing', async () => {
    expect(await repo.findByEmail('nobody@example.com')).toBeNull();
  });
});

describe('findById', () => {
  it('finds a staff account by id', async () => {
    const admin = await createAdmin();

    expect((await repo.findById(admin.id))?.email).toBe('staff@example.com');
  });

  it('returns null for an unknown id', async () => {
    expect(await repo.findById('missing')).toBeNull();
  });
});
