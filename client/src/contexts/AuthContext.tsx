import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { upsertUser } from "@/lib/leaderboard";

interface User {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGitHub: () => void;
  loginWithGoogle: () => void;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const REDIRECT_URI = window.location.origin + "/signin";

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem("scrubin_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("scrubin_user");
      }
    }
    setLoading(false);

    // Check for OAuth code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Check sessionStorage for provider, fallback to detecting from URL pattern
      const storedProvider = sessionStorage.getItem("oauth_provider");
      const provider = storedProvider || "github"; // default to github
      sessionStorage.removeItem("oauth_provider");
      handleCallback(code, provider);
    }
  }, []);

  const handleCallback = async (code: string, provider: string) => {
    setLoading(true);
    setError(null);
    try {
      // Exchange code for user data via backend proxy
      const endpoint = provider === "google" ? "/api/auth/google" : "/api/auth/github";
      const response = await axios.post(endpoint, { code });
      const userData = response.data.user;

      setUser(userData);
      localStorage.setItem("scrubin_user", JSON.stringify(userData));

      // Save user to Supabase for leaderboard

      await upsertUser({

        id: userData.id,

        name: userData.name,

        login: userData.login,

        avatar_url: userData.avatar_url

      });

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect to profile
      window.location.href = "/profile";
    } catch (err: any) {
      console.error(`${provider} Login Error:`, err);
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGitHub = () => {
    const scope = "read:user user:email";
    // Store provider in sessionStorage to detect on callback
    sessionStorage.setItem("oauth_provider", "github");
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
  };

  const loginWithGoogle = () => {
    const scope = "openid email profile";
    // Store provider in sessionStorage to detect on callback
    sessionStorage.setItem("oauth_provider", "google");
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("scrubin_user");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGitHub, loginWithGoogle, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
