import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { getToken, clearToken } from "@/lib/auth";

export interface UserProfile {
  id: number;
  name: string;
  username?: string | null;
  studentId: string;
  email?: string | null;
  level: string;
  institution: string;
  country?: string | null;
  profilePicture?: string | null;
  subscriptionStatus?: "free" | "active" | "expired";
  accountBalance?: string;
  virtualBalance?: string;
  planType?: "weekly" | "monthly" | null;
  planCurrency?: string | null;
  planEndDate?: string | null;
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  logout: () => void;
  refetch: () => void;
  updateProfilePicture: (dataUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: () => {},
  refetch: () => {},
  updateProfilePicture: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  async function fetchProfile() {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        clearToken();
        setUser(null);
      } else if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function updateProfilePicture(dataUrl: string) {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`${import.meta.env.BASE_URL}api/user/profile-picture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dataUrl }),
    });
    if (res.ok) {
      setUser((prev) => prev ? { ...prev, profilePicture: dataUrl } : prev);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  function logout() {
    clearToken();
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refetch: fetchProfile, updateProfilePicture }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
