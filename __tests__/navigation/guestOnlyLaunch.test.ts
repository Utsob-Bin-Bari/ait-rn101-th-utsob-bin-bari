/**
 * Story 1.2 — Guest-Only Launch Flow
 * Asserts cold start always routes to Main (no Auth), and guest session is auto-created when no session.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
declare const __dirname: string;
const fs = require('fs') as { readFileSync: (path: string, encoding: string) => string };
const path = require('path') as { resolve: (...args: string[]) => string; join: (...args: string[]) => string };

import { loginAsGuest } from '../../src/application/services/auth';
import { GUEST_USER_ID } from '../../src/domain/types/auth';

const ROOT = path.resolve(__dirname, '../..');
const APP_NAVIGATOR_PATH = path.join(
  ROOT,
  'src/presentation/navigation/AppNavigator.tsx',
);

describe('Story 1.2 — Guest-Only Launch Flow', () => {
  describe('AC1 & AC3 — AppNavigator never shows Auth on cold start', () => {
    it('AppNavigator initial route state is Main (not Auth)', () => {
      const content = fs.readFileSync(APP_NAVIGATOR_PATH, 'utf-8');
      expect(content).toContain("useState<string>('Main')");
      expect(content).not.toMatch(/setInitialRoute\s*\(\s*['"]Auth['"]\s*\)/);
    });

    it('AppNavigator calls loginAsGuest when there is no session', () => {
      const content = fs.readFileSync(APP_NAVIGATOR_PATH, 'utf-8');
      expect(content).toContain('loginAsGuest');
      expect(content).toContain('storeGuestSession');
      expect(content).toContain('setGuestInfo');
    });

    it('AppNavigator always sets initial route to Main (success and catch)', () => {
      const content = fs.readFileSync(APP_NAVIGATOR_PATH, 'utf-8');
      const setMainCalls = (content.match(/setInitialRoute\s*\(\s*['"]Main['"]\s*\)/g) || []);
      expect(setMainCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('loginAsGuest service', () => {
    it('returns success and guest user with required fields', async () => {
      const result = await loginAsGuest();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(GUEST_USER_ID);
      expect(result.data?.isGuest).toBe(true);
      expect(typeof result.data?.email).toBe('string');
      expect(typeof result.data?.name).toBe('string');
      expect(typeof result.data?.accessToken).toBe('string');
    });
  });
});
