import { describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({ error: null })),
    })),
  },
}));

describe('AuthContext', () => {
  it('should export AuthProvider and useAuth', () => {
    expect(AuthProvider).toBeDefined();
    expect(useAuth).toBeDefined();
  });
});
