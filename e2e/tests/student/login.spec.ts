import { expect } from '@playwright/test';
import { test } from '../../base';
import { describe } from 'node:test';

describe("Student login tests", () => {
  test('A new student can login and view the profile creation screen', async ({ page, becomeUser }) => {
    await becomeUser(page, {email: 'noone@testing.illinois.edu', role: 'student'})
    await page.getByRole('link', { name: 'My Profile' }).click();
    expect(page.getByText('Welcome to Resume Book')).toBeTruthy()
    expect(page.getByText('User,Resume Book')).toBeTruthy();
  });
  test('An existing user can log in and view their profile', async ({ page, becomeUser }) => {
    await becomeUser(page, {email: 'mainuser1@testing.illinois.edu', role: 'student'})
    await page.getByRole('link', { name: 'My Profile' }).click();
    expect(page.getByText('Resume Book User')).toBeTruthy()
    expect(page.getByText('Skills')).toBeTruthy()
    expect(page.getByText('Botting')).toBeTruthy()
  });
})