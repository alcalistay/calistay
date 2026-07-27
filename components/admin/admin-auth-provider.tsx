"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { firebaseEnabled, getFirebaseAuth } from "@/lib/firebase";

type Ctx = {
  user: User | null;
  loading: boolean;
  /** Firebase yapılandırılmamışsa panel çalışamaz; ekranda uyarı gösterilir. */
  configured: boolean;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<Ctx>({
  user: null,
  loading: true,
  configured: false,
  logout: async () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Firebase yapılandırılmamışsa beklenecek bir oturum yok.
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    return onAuthStateChanged(auth, (current) => {
      setUser(current);
      setLoading(false);
    });
  }, []);

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
  };

  return (
    <AdminAuthContext.Provider
      value={{ user, loading, configured: firebaseEnabled, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
