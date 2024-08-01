import { test as base } from '@playwright/test';
import {sign} from 'jsonwebtoken';
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

async function becomeUser(page, email: string, role: string = 'student') {
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

export const test = base.extend<{ generateJWT: CallableFunction, becomeUser: CallableFunction }>({
    generateJWT: async ({}, use) => {
        use(generateJWT)
    },
    becomeUser: async ({}, use) => {
        use(becomeUser)
    },
});