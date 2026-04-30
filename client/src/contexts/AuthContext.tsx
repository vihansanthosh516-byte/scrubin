import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { upsertUser } from "@/lib/leaderboard";

interface User {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
  email: string | null;
  profession?: string;
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
  isReturningUser: boolean;
  confirmReturningUser: () => void;
  restartOnboarding: () => void;
  completeOnboarding: (data: { displayName: string; username: string }) => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, profession: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);

  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const REDIRECT_URI = window.location.origin + "/signin";

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem("scrubin_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Also check for existing profile data
        const existingProfile = localStorage.getItem(`scrubin_user_profile_${parsedUser.id}`);
        if (existingProfile) {
          const profileData = JSON.parse(existingProfile);
          const completeUser = {
            ...parsedUser,
            ...profileData,
            hasCompletedOnboarding: true,
          };
          setUser(completeUser);
          setHasCompletedOnboarding(true);
        } else {
          setUser(parsedUser);
          setHasCompletedOnboarding(!!parsedUser.hasCompletedOnboarding);
        }
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
      const response = await axios.post(endpoint, { code, redirect_uri: REDIRECT_URI });
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
        setIsReturningUser(true); // Show welcome back screen
        localStorage.setItem("scrubin_user", JSON.stringify(completeUser));
        localStorage.setItem("scrubin_last_user", JSON.stringify({ name: completeUser.name, login: completeUser.login }));
      } else {
        const completeUser = { ...userData, hasCompletedOnboarding: true };
        setUser(completeUser);
        setHasCompletedOnboarding(true);
        setIsReturningUser(false);
        localStorage.setItem("scrubin_user", JSON.stringify(completeUser));
        localStorage.setItem("scrubin_last_user", JSON.stringify({ name: completeUser.name, login: completeUser.login }));
      }

      await upsertUser({
        id: userData.id,
        name: userData.name,
        login: userData.login,
        avatar_url: userData.avatar_url,
      });

      // Redirect directly to profile
      window.location.href = "/profile";

    } catch (err: any) {
      console.error(`${provider} Login Error:`, err);
      setError("Authentication failed. Please try again.");
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

  const completeOnboarding = async (data: { displayName: string; profession: string }) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: data.displayName,
      profession: data.profession,
      hasCompletedOnboarding: true,
    };

    setUser(updatedUser);
    setHasCompletedOnboarding(true);
    localStorage.setItem("scrubin_user", JSON.stringify(updatedUser));
    localStorage.setItem(`scrubin_user_profile_${user.id}`, JSON.stringify({
      name: data.displayName,
      profession: data.profession,
      hasCompletedOnboarding: true,
    }));

    // Redirect to profile using window.location to avoid wouter issues
    window.location.href = "/profile";
  };

  const confirmReturningUser = () => {
    setIsReturningUser(false);
    window.location.href = "/profile";
  };

  const restartOnboarding = () => {
    setIsReturningUser(false);
    setHasCompletedOnboarding(false);
    // Keep user data but allow them to re-enter name/username
    window.location.href = "/onboarding";
  };

  const logout = () => {
    setUser(null);
    setHasCompletedOnboarding(false);
    localStorage.removeItem("scrubin_user");
    window.location.href = "/signin";
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await (await import("../lib/supabase")).supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const nameToUse = data.user.user_metadata?.full_name || email.split("@")[0];
        const userData: User = {
          id: data.user.id,
          name: nameToUse,
          login: data.user.user_metadata?.user_name || email.split("@")[0],
          avatar_url: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse)}&backgroundColor=7EC8E3&textColor=000000`,
          email: data.user.email || null,
        };

        // Check for existing profile
        const profileKey = `scrubin_user_profile_${userData.id}`;
        const existingUserData = localStorage.getItem(profileKey);
        if (existingUserData) {
          const existingProfile = JSON.parse(existingUserData);
          const completeUser = { ...userData, ...existingProfile, hasCompletedOnboarding: true };
          setUser(completeUser);
          setHasCompletedOnboarding(true);
          localStorage.setItem("scrubin_user", JSON.stringify(completeUser));
          localStorage.setItem("scrubin_last_user", JSON.stringify({ name: completeUser.name, login: completeUser.login }));
        } else {
          const completeUser = { ...userData, hasCompletedOnboarding: true };
          setUser(completeUser);
          setHasCompletedOnboarding(true);
          localStorage.setItem("scrubin_user", JSON.stringify(completeUser));
          localStorage.setItem("scrubin_last_user", JSON.stringify({ name: completeUser.name, login: completeUser.login }));
        }

        await upsertUser({
          id: userData.id,
          name: userData.name,
          login: userData.login,
          avatar_url: userData.avatar_url,
        });

        // Redirect to profile
        window.location.href = "/profile";
      }
      return { error: null };
    } catch (err: any) {
      console.error("SignIn Error:", err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, name: string, profession: string) => {
    try {
      const { data, error } = await (await import("../lib/supabase")).supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            profession: profession,
          }
        }
      });

      if (error) throw error;

      // Detect if user already exists (Supabase security feature returns empty identities)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error("Email is already registered. Please sign in.");
      }

      if (data.user) {
        const userData: User = {
          id: data.user.id,
          name: name,
          login: email.split("@")[0],
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=7EC8E3&textColor=000000`,
          email: data.user.email || null,
          profession: profession,
          hasCompletedOnboarding: true,
        };

        // Save profile data for future logins
        localStorage.setItem(`scrubin_user_profile_${userData.id}`, JSON.stringify({
          name: userData.name,
          profession: userData.profession,
          hasCompletedOnboarding: true,
        }));

        setUser(userData);
        setHasCompletedOnboarding(true);
        localStorage.setItem("scrubin_user", JSON.stringify(userData));
        localStorage.setItem("scrubin_last_user", JSON.stringify({ name: userData.name, login: userData.login }));

        await upsertUser({
          id: userData.id,
          name: userData.name,
          login: userData.login,
          avatar_url: userData.avatar_url,
        });

        // Redirect to profile
        window.location.href = "/profile";
      }
      return { error: null };
    } catch (err: any) {
      console.error("SignUp Error:", err);
      return { error: err };
    }
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
        isReturningUser,
        confirmReturningUser,
        restartOnboarding,
        completeOnboarding,
        signIn,
        signUp,
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
