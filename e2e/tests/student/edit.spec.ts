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
    if (!(await page.getByRole('button', { name: 'Remove' }).nth(1).isVisible())) {
      await page.getByRole('button', { name: 'Add Degree' }).click();
      await page.getByRole('textbox', { name: 'Major' }).click();
      await page.getByRole('option', { name: 'Computer Science', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Save' }).click();
    expect(await page.waitForSelector('text="Profile saved!"')).toBeTruthy();
  });
  test('Profiles with no degrees fail to save', async ({ page, becomeUser }) => {
    await becomeUser(page, {email: 'nonexistent@testing.illinois.edu', role: 'student'})
    await page.getByRole('link', { name: 'My Profile' }).click();
    expect(page.getByText('Resume Book User')).toBeTruthy()
    expect(page.getByText('Skills')).toBeTruthy()
    expect(page.getByText('Botting')).toBeTruthy()
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    expect(await page.waitForSelector('text="You must specify at least one degree."')).toBeTruthy();
  });
})