import { expect, test } from '@playwright/test';

/** A unique name per run, so one run's rows never match another's. */
const uniquePatient = () => `E2E Patient ${Date.now()}`;

/** The duplicate-request guard is keyed on phone, so each test needs its own. */
const uniquePhone = () => `+91 98${String(Date.now()).slice(-8)}`;

const tomorrowIso = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

test.describe('requesting an appointment', () => {
  test('a completed request shows a confirmation that does not promise a booking', async ({
    page,
  }) => {
    await page.goto('/appointment');

    await page.getByLabel('Your full name').fill(uniquePatient());
    await page.getByLabel('Phone number').fill(uniquePhone());
    await page.getByLabel('Preferred date').fill(tomorrowIso());
    await page.getByLabel('Preferred time of day').selectOption('AFTERNOON');
    await page
      .getByLabel('Why would you like to be seen?')
      .fill('Recurring headaches most afternoons for the past three weeks.');

    await page.getByRole('button', { name: 'Send request' }).click();

    await expect(page.getByRole('heading', { name: 'Request received' })).toBeVisible();
    await expect(page.getByText('This is not a confirmed booking yet.')).toBeVisible();
  });

  test('an empty form reports the fields to fix and sends nothing', async ({ page }) => {
    await page.goto('/appointment');

    await page.getByRole('button', { name: 'Send request' }).click();

    await expect(page.getByText('Please enter your full name')).toBeVisible();
    await expect(page.getByText('Please choose a date')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Request received' })).toBeHidden();
  });

  test('a reason that is too short is rejected before submitting', async ({ page }) => {
    await page.goto('/appointment');

    await page.getByLabel('Your full name').fill(uniquePatient());
    await page.getByLabel('Phone number').fill(uniquePhone());
    await page.getByLabel('Preferred date').fill(tomorrowIso());
    await page.getByLabel('Why would you like to be seen?').fill('pain');

    await page.getByRole('button', { name: 'Send request' }).click();

    await expect(page.getByText(/why you would like to be seen/i)).toBeVisible();
  });

  test('a doctor link pre-selects that doctor on the form', async ({ page }) => {
    await page.goto('/doctors/vikram-iyer');
    await page.getByRole('link', { name: 'Request an appointment' }).click();

    await expect(page).toHaveURL(/\/appointment\?doctor=/);
    await expect(page.getByLabel('Doctor you would like to see')).not.toHaveValue('');
  });
});
