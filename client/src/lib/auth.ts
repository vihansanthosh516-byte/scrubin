import { request } from "./api";

export interface OAuthCallbackResponse {
  user: {
    id: string;
    name: string;
    login: string;
    avatar_url: string;
    email?: string | null;
  };
}

/**
 * Exchange OAuth `code` for a user profile.
 * `provider` must be "github" or "google".
 */
export async function exchangeOAuthCode(
  code: string,
  provider: "github" | "google"
): Promise<OAuthCallbackResponse> {
  const endpoint = provider === "google" ? "/api/auth/google" : "/api/auth/github";
  return request<OAuthCallbackResponse>(endpoint, {
    method: "POST",
    body: JSON.stringify({ code, redirect_uri: window.location.origin + "/signin" }),
  });
}
