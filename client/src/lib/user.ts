import { request } from "./api";

export interface UserProfile {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
  email?: string | null;
  profession?: string;
}

/** Fetch current authenticated user (session cookie based) */
export function getCurrentUser() {
  return request<UserProfile>("/api/auth/me");
}
