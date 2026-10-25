import { expect, test, type Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@meridianclinic.example';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? '';

const signIn = async (page: Page): Promise<void> => {
  await page.goto('/admin/login');
  await page.getByLabel('Email address').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Appointment requests' })).toBeVisible();
};

test.describe('the staff area', () => {
  test('redirects a signed-out visitor to the login page', async ({ page }) => {
    await page.goto('/admin/appointments');

    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in');
  });

  test('rejects wrong details without saying which part was wrong', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email address').fill(ADMIN_EMAIL);
    await page.getByLabel('Password').fill('definitely-not-the-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Scoped to the form: Next's route announcer is also role="alert".
    await expect(page.locator('form').getByRole('alert', { includeHidden: false })).toHaveText(
      'Those details do not match an account.',
    );
  });

  test('signs in, finds a new request and advances it to confirmed', async ({ page }) => {
    const patientName = `E2E Inbox ${Date.now()}`;
    const phone = `+91 97${String(Date.now()).slice(-8)}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await page.goto('/appointment');
    await page.getByLabel('Your full name').fill(patientName);
    await page.getByLabel('Phone number').fill(phone);
    await page.getByLabel('Preferred date').fill(tomorrow.toISOString().slice(0, 10));
    await page
      .getByLabel('Why would you like to be seen?')
      .fill('Follow-up on last month’s blood test results.');
    await page.getByRole('button', { name: 'Send request' }).click();
    await expect(page.getByRole('heading', { name: 'Request received' })).toBeVisible();

    await signIn(page);

    const row = page.locator('li', { hasText: patientName }).first();
    await expect(row).toBeVisible();

    await row.getByLabel('Status').selectOption('CONFIRMED');
    await row.getByLabel('Staff note').fill('Called, confirmed for 3pm.');
    await row.getByRole('button', { name: 'Save' }).click();

    await expect(row.getByText('Saved.')).toBeVisible();

    await page.goto('/admin/appointments?status=CONFIRMED');
    await expect(page.getByText(patientName)).toBeVisible();
  });

  test('an edited doctor appears on the public site straight away', async ({ page }) => {
    const original = 'Consultant Family Physician · Clinical Lead';
    const edited = `Consultant Family Physician ${Date.now()}`;

    const editDesignation = async (value: string) => {
      await page.goto('/admin/doctors');
      const row = page.locator('li', { hasText: 'Dr. Ananya Rao' }).first();
      await row.getByRole('button', { name: 'Edit' }).click();
      await page.getByLabel('Designation').fill(value);
      await page.getByRole('button', { name: 'Save doctor' }).click();
      await expect(page.getByRole('status')).toContainText('Saved.');
    };

    await signIn(page);
    await editDesignation(edited);

    await page.goto('/doctors/ananya-rao');
    await expect(page.getByText(edited)).toBeVisible();

    // Restore, so the suite leaves the seeded database as it found it.
    await editDesignation(original);
    await page.goto('/doctors/ananya-rao');
    await expect(page.getByText(original)).toBeVisible();
  });

  test('withdrawing a service removes it from the public list', async ({ page }) => {
    await signIn(page);
    await page.getByRole('link', { name: 'Services' }).click();

    const row = page.locator('li', { hasText: 'Allergy' }).first();
    const hasRow = await row.count();

    // Use dental care, which the seed always provides.
    const target = hasRow ? row : page.locator('li', { hasText: 'Dental Care' }).first();
    await target.getByRole('button', { name: 'Withdraw' }).click();
    await expect(target.getByText('Withdrawn')).toBeVisible();

    await page.goto('/services');
    await expect(page.getByRole('link', { name: 'Dental Care' })).toBeHidden();

    // Put it back, so the suite can run again from the same seed.
    await page.goto('/admin/services');
    const restored = page.locator('li', { hasText: 'Dental Care' }).first();
    await restored.getByRole('button', { name: 'Offer' }).click();
    await expect(restored.getByText('Withdrawn')).toBeHidden();
  });

  test('renaming a service retires its old URL instead of serving a stale page', async ({
    page,
  }) => {
    const renamed = `dental-care-${Date.now()}`;

    const setSlug = async (value: string) => {
      await page.goto('/admin/services');
      await page
        .locator('li', { hasText: 'Dental Care' })
        .first()
        .getByRole('button', { name: 'Edit' })
        .click();
      await page.getByLabel('Web address').fill(value);
      await page.getByRole('button', { name: 'Save service' }).click();
      await expect(page.getByRole('status')).toContainText('Saved.');
    };

    await signIn(page);
    await setSlug(renamed);

    // The new URL serves, and the old one is gone rather than cached.
    await expect((await page.goto(`/services/${renamed}`))?.status()).toBe(200);
    await expect((await page.goto('/services/dental-care'))?.status()).toBe(404);

    // Restore, so the suite leaves the seeded database as it found it.
    await setSlug('dental-care');
    await expect((await page.goto('/services/dental-care'))?.status()).toBe(200);
  });

  test('signing out closes the staff area again', async ({ page }) => {
    await signIn(page);

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.goto('/admin/doctors');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
