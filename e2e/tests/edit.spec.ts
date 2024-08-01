import { expect } from '@playwright/test';
import { test } from '../base';
import { describe } from 'node:test';

describe("Test that users can edit their profile", () => {
  test('Test that editing and immediately saving works.', async ({ page, becomeUser }) => {
    await becomeUser(page, 'mainuser1@testing.illinois.edu')
    await page.goto('https://resumes.qa.acmuiuc.org/');
    await page.goto('https://resumes.qa.acmuiuc.org/login');
    await page.getByRole('button', { name: 'Sign in with Illinois NetID' }).click();
    await page.getByPlaceholder('NetID@illinois.edu').click();
    await page.getByPlaceholder('NetID@illinois.edu').fill(process.env.RB_PLAYWRIGHT_USERNAME!);
    await page.getByPlaceholder('NetID@illinois.edu').press('Enter');
    await page.getByPlaceholder('Password').click();
    await page.getByPlaceholder('Password').fill(process.env.RB_PLAYWRIGHT_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: 'No' }).click();
    await page.getByRole('link', { name: 'My Profile' }).click();
    expect(page.getByText('Resume Book User')).toBeTruthy()
    expect(page.getByText('Skills')).toBeTruthy()
    expect(page.getByText('Botting')).toBeTruthy()
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    expect(await page.waitForSelector('text="Profile saved!"')).toBeTruthy();
  });
})