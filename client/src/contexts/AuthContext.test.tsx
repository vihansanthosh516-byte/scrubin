import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';

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
  it('should provide auth functions', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.signIn).toBeDefined();
    expect(result.current.signUp).toBeDefined();
    expect(result.current.loading).toBe(false);
  });

  it('should handle sign up', async () => {
    const { supabase } = await import('../lib/supabase');
    const mockUser = { id: 'test-uuid', email: 'test@example.com' };
    (supabase.auth.signUp as any).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    let response;
    await act(async () => {
      response = await result.current.signUp('test@example.com', 'password123', 'Test User', 'Resident');
    });
    
    expect(response).toEqual({ error: null });
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User',
          profession: 'Resident'
        }
      }
    });
  });
});
