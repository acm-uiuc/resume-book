import { test as base } from '@playwright/test';
import { sign } from 'jsonwebtoken';
// Extend basic test by providing a "todoPage" fixture.

function generateJWT(email: string, role: string = 'student', env: string = 'dev'): string {
  const JWT_SECRET = process.env.RB_JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("JWT Secret not found in environment variable RB_JWT_SECRET.");
    return "";
  }

  const iat = Math.floor(Date.now() / 1000); // Current time in seconds since the Unix epoch
  const exp = iat + (24 * 60 * 60); // Token expiration time (24 hours later)

  const payload = {
    iss: 'custom_jwt',
    permissions: [`${role}:resume-book-${env}`],
    email: email,
    exp: exp,
    iat: iat,
    nbf: iat,
    aud: 'https://resumes.aws.qa.acmuiuc.org',
  };

  return sign(payload, JWT_SECRET, { algorithm: 'HS256' });
}
interface BecomeUserParams {
  email?: string
  role: string;
}
async function becomeUser(page, { email, role }: BecomeUserParams) {
  if (!email) {
    email = process.env.RB_PLAYWRIGHT_USERNAME!;
  }
  if (email !== process.env.RB_PLAYWRIGHT_USERNAME!) {
    const jwt = generateJWT(email, role);
    await page.route('**/*', async route => {
      if (route.request().url().startsWith('https://resumes.aws.qa.acmuiuc.org/')) {
        const token = generateJWT("newuser@testing.illinois.edu")
        const headers = {
          ...route.request().headers(),
          'Authorization': `Bearer ${jwt}`
        };

        // Continue with modified headers
        route.continue({ headers });
      } else {
        // Continue with the normal routing for other URLs
        route.continue();
      }
    });
  }
  if (role === 'student') {
    await page.goto('https://resumes.qa.acmuiuc.org/login');
    await page.getByRole('button', { name: 'Sign in with Illinois NetID' }).click();
    await page.getByPlaceholder('NetID@illinois.edu').click();
    await page.getByPlaceholder('NetID@illinois.edu').fill(process.env.RB_PLAYWRIGHT_USERNAME!);
    await page.getByPlaceholder('NetID@illinois.edu').press('Enter');
    await page.getByPlaceholder('Password').click();
    await page.getByPlaceholder('Password').fill(process.env.RB_PLAYWRIGHT_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: 'No' }).click();
  } else if (role === 'recruiter') {
    await page.goto('https://resumes.qa.acmuiuc.org/login');
    await page.getByRole('button', { name: 'ACM@UIUC Partner Login' }).click();
    await page.waitForTimeout(1000)
    await page.locator("#sign_up_sign_in_credentials_p_email_username").click();
    await page.locator("#sign_up_sign_in_credentials_p_email_username").fill(process.env.RB_PLAYWRIGHT_USERNAME!);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByPlaceholder('NetID@illinois.edu').click();
    await page.getByPlaceholder('NetID@illinois.edu').fill(process.env.RB_PLAYWRIGHT_USERNAME!);
    await page.getByPlaceholder('NetID@illinois.edu').press('Enter');
    await page.getByPlaceholder('Password').click();
    await page.getByPlaceholder('Password').fill(process.env.RB_PLAYWRIGHT_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: 'No' }).click();
  }
}

export const test = base.extend<{ generateJWT: CallableFunction, becomeUser: (page, params: BecomeUserParams) => Promise<void> }>({
  generateJWT: async ({ }, use) => {
    use(generateJWT)
  },
  becomeUser: async ({ }, use) => {
    use(becomeUser)
  },
});
