import { expect } from '@playwright/test';
import { test } from '../../base';
import { describe } from 'node:test';

describe("Test that users can edit their profile", () => {
  test('Editing and immediately saving a profile succeeds', async ({ page, becomeUser }) => {
    await becomeUser(page, {email: 'mainuser1@testing.illinois.edu', role: 'student'})
    await page.getByRole('link', { name: 'My Profile' }).click();
    expect(page.getByText('Resume Book User')).toBeTruthy()
    expect(page.getByText('Skills')).toBeTruthy()
    expect(page.getByText('Botting')).toBeTruthy()
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    expect(await page.waitForSelector('text="Profile saved!"')).toBeTruthy();
  });
})