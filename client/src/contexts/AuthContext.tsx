import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { upsertUser } from "@/lib/leaderboard";

interface User {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
  email: string | null;
  customUsername?: string;
  hasCompletedOnboarding?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGitHub: () => void;
  loginWithGoogle: () => void;
  logout: () => void;
  error: string | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (data: { displayName: string; username: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const REDIRECT_URI = window.location.origin + "/signin";

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem("scrubin_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setHasCompletedOnboarding(!!parsedUser.hasCompletedOnboarding);
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
      const storedProvider = sessionStorage.getItem("oauth_provider");
      const provider = storedProvider || "github";
      sessionStorage.removeItem("oauth_provider");
      handleCallback(code, provider);
    }
  }, []);

  const handleCallback = async (code: string, provider: string) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = provider === "google" ? "/api/auth/google" : "/api/auth/github";
      const response = await axios.post(endpoint, { code });
      const userData = response.data.user;

      // Check if this user has already completed onboarding
      const existingUserData = localStorage.getItem(`scrubin_user_profile_${userData.id}`);

      if (existingUserData) {
        const existingProfile = JSON.parse(existingUserData);
        const completeUser = {
          ...userData,
          ...existingProfile,
          hasCompletedOnboarding: true,
        };
        setUser(completeUser);
        setHasCompletedOnboarding(true);
        localStorage.setItem("scrubin_user", JSON.stringify(completeUser));
      } else {
        setUser(userData);
        setHasCompletedOnboarding(false);
        localStorage.setItem("scrubin_user", JSON.stringify(userData));
      }

      await upsertUser({
        id: userData.id,
        name: userData.name,
        login: userData.login,
        avatar_url: userData.avatar_url,
      });

      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err: any) {
      console.error(`${provider} Login Error:`, err);
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGitHub = () => {
    const scope = "read:user user:email";
    sessionStorage.setItem("oauth_provider", "github");
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
  };

  const loginWithGoogle = () => {
    const scope = "openid email profile";
    sessionStorage.setItem("oauth_provider", "google");
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`;
  };

  const completeOnboarding = (data: { displayName: string; username: string }) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: data.displayName,
      customUsername: data.username,
      hasCompletedOnboarding: true,
    };

    setUser(updatedUser);
    setHasCompletedOnboarding(true);
    localStorage.setItem("scrubin_user", JSON.stringify(updatedUser));
    localStorage.setItem(`scrubin_user_profile_${user.id}`, JSON.stringify({
      name: data.displayName,
      customUsername: data.username,
    }));

    // Redirect to profile using window.location to avoid wouter issues
    window.location.href = "/profile";
  };

  const logout = () => {
    setUser(null);
    setHasCompletedOnboarding(false);
    localStorage.removeItem("scrubin_user");
    window.location.href = "/signin";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGitHub,
        loginWithGoogle,
        logout,
        error,
        isAuthenticated: !!user,
        hasCompletedOnboarding,
        completeOnboarding,
      }}
    >
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
