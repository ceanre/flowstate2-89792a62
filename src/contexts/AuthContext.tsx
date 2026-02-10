import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { getUserProfile, createUserProfile } from "@/lib/firestore";
import { UserProfile } from "@/types";

const ADMIN_EMAIL = "prod.ceanre@gmail.com";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  needsUsername: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  setNeedsUsername: (v: boolean) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  needsUsername: false,
  isAdmin: false,
  signInWithGoogle: async () => {},
  logout: async () => {},
  setProfile: () => {},
  setNeedsUsername: () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);

  const isAdmin = profile?.isAdmin || user?.email === ADMIN_EMAIL;

  const loadProfile = async (u: User) => {
    const existing = await getUserProfile(u.uid);
    if (existing) {
      // Bootstrap admin if email matches
      if (u.email === ADMIN_EMAIL && !existing.isAdmin) {
        existing.isAdmin = true;
        await import("@/lib/firestore").then((m) => m.updateUserProfile(u.uid, { isAdmin: true }));
      }
      setProfile(existing);
      setNeedsUsername(false);
    } else {
      setNeedsUsername(true);
    }
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadProfile(u);
      } else {
        setProfile(null);
        setNeedsUsername(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Sign in error:", e);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        needsUsername,
        isAdmin,
        signInWithGoogle,
        logout,
        setProfile,
        setNeedsUsername,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
