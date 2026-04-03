import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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
  login: () => void;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
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
      handleCallback(code);
    }
  }, []);

  const handleCallback = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      // Exchange code for user data via backend proxy
      const response = await axios.post("/api/auth/github", { code });
      const userData = response.data.user;
      
      setUser(userData);
      localStorage.setItem("scrubin_user", JSON.stringify(userData));
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Redirect to profile
      window.location.href = "/profile";
    } catch (err: any) {
      console.error("GitHub Login Error:", err);
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    const scope = "read:user user:email";
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("scrubin_user");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, error }}>
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
