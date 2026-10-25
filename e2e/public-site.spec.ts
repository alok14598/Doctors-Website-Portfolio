import { expect, test } from '@playwright/test';

const PAGES = [
  // The home h1 is the seeded hero headline, whose two halves render in
  // different colours but read as one sentence.
  { path: '/', heading: 'Trusted family care for a healthier you' },
  { path: '/about', heading: 'About Meridian Family Clinic' },
  { path: '/services', heading: 'What we treat and test for' },
  { path: '/doctors', heading: 'The people who will see you' },
  { path: '/facilities', heading: 'What is available in the clinic' },
  { path: '/patient-info', heading: 'Before your first visit' },
  { path: '/contact', heading: 'How to reach us' },
  { path: '/appointment', heading: 'Request an appointment' },
];

test.describe('public pages', () => {
  for (const page of PAGES) {
    test(`${page.path} renders with exactly one h1`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);

      const headings = browserPage.locator('h1');
      await expect(headings).toHaveCount(1);
      await expect(headings).toHaveText(page.heading);
    });
  }

  test('an unknown path renders the 404 page', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('We could not find that page');
  });

  test('navigating to a doctor profile shows their registration number', async ({ page }) => {
    await page.goto('/doctors');
    await page.getByRole('link', { name: /Read profile for Dr. Ananya Rao/ }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dr. Ananya Rao');
    await expect(page.getByText('KMC/2004/18432')).toBeVisible();
  });

  test('filtering doctors by specialty narrows the list', async ({ page }) => {
    await page.goto('/doctors');
    const allCount = await page.locator('h3').count();

    await page.getByRole('link', { name: 'Paediatrics' }).click();

    await expect(page).toHaveURL(/specialty=paediatrics/);
    expect(await page.locator('h3').count()).toBeLessThan(allCount);
    await expect(page.getByRole('heading', { name: 'Dr. Vikram Iyer' })).toBeVisible();
  });

  test('a service page lists the doctors who perform it', async ({ page }) => {
    await page.goto('/services/general-consultation');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('General Consultation');
    await expect(page.getByRole('link', { name: 'Dr. Ananya Rao' })).toBeVisible();
  });

  test('robots.txt keeps crawlers out of the staff area', async ({ request }) => {
    const response = await request.get('/robots.txt');

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('Disallow: /admin');
  });

  test('the health endpoint reports the database and which build is live', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      status: 'ok',
      database: 'ok',
      // Populated from VERCEL_* on a deployment; "local" everywhere else.
      build: { commit: expect.any(String), environment: expect.any(String) },
    });
  });
});
