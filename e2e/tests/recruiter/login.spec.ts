
import { expect } from '@playwright/test';
import { test } from '../../base';
import { describe } from 'node:test';

describe("Recruiter login tests", () => {
  test('A recruiter can login and view the search screen', async ({ page, becomeUser }) => {
    await becomeUser(page, { role: 'recruiter' });
    await page.getByRole('link', { name: 'My Account' }).click();
    await expect(page.getByRole('button', { name: 'Email resumebook-e2e-testing@' })).toBeVisible();
    await expect(page.getByRole('heading')).toContainText('Search Resume Book');
  });
})
