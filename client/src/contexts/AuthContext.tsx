import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile,
  type User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { api } from '../services/api';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: {
    displayName?: string;
    username?: string;
    title?: string;
    bio?: string;
    photoURL?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_FALLBACK_STORAGE_KEY = 'nexvps_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check whether an email is admin (default: sanzzydev@gmail.com, or queried from backend)
  const resolveAdminStatus = async (email: string): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'sanzzydev@gmail.com') {
      return true;
    }
    try {
      const res = await api.checkAdmin(cleanEmail);
      return res.isAdmin;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Clean up any old demo session from previous tests
    localStorage.removeItem('nexvps_demo_session');

    // Check if there is an active admin session fallback
    const savedAdmin = localStorage.getItem(ADMIN_FALLBACK_STORAGE_KEY);
    if (savedAdmin) {
      try {
        const parsed: AuthUser = JSON.parse(savedAdmin);
        if (parsed.email.toLowerCase() === 'sanzzydev@gmail.com') {
          setUser(parsed);
          api.setAdminEmail(parsed.email);
          setLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem(ADMIN_FALLBACK_STORAGE_KEY);
      }
    }

    // Firebase live auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser && fbUser.email) {
        const isAdmin = await resolveAdminStatus(fbUser.email);
        let savedProfile: Partial<AuthUser> = {};
        try {
          const raw = localStorage.getItem(`nexvps_profile_${fbUser.email.toLowerCase()}`);
          if (raw) savedProfile = JSON.parse(raw);
        } catch {}

        const mappedUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: savedProfile.displayName || fbUser.displayName || fbUser.email.split('@')[0],
          username: savedProfile.username || fbUser.email.split('@')[0].toLowerCase(),
          title: savedProfile.title || (isAdmin ? 'Lead Cloud Architect' : 'Cloud Engineer'),
          bio: savedProfile.bio || 'Deploying high-performance MaxIOPS Cloud VPS on NexVps infrastructure.',
          role: isAdmin ? 'Admin' : 'Pro Member',
          memberSince: savedProfile.memberSince || 'Jan 2026',
          photoURL: savedProfile.photoURL || fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          isAdmin
        };
        setUser(mappedUser);
        api.setAdminEmail(isAdmin ? fbUser.email : null);
      } else {
        const activeAdmin = localStorage.getItem(ADMIN_FALLBACK_STORAGE_KEY);
        if (!activeAdmin) {
          setUser(null);
          api.setAdminEmail(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const cleanEmail = email.toLowerCase().trim();

    // Default admin auto-provisioning / sign-in
    if (cleanEmail === 'sanzzydev@gmail.com' && password === '347100') {
      try {
        // Try Firebase sign in first
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const mappedUser: AuthUser = {
          uid: cred.user.uid,
          email: cleanEmail,
          displayName: cred.user.displayName || 'Super Admin Sanzzy',
          photoURL: cred.user.photoURL || undefined,
          isAdmin: true
        };
        setUser(mappedUser);
        api.setAdminEmail(cleanEmail);
        localStorage.setItem(ADMIN_FALLBACK_STORAGE_KEY, JSON.stringify(mappedUser));
        return;
      } catch (err: any) {
        // If user does not exist in Firebase project yet, create it automatically!
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            await updateProfile(newCred.user, { displayName: 'Super Admin Sanzzy' });
            const mappedUser: AuthUser = {
              uid: newCred.user.uid,
              email: cleanEmail,
              displayName: 'Super Admin Sanzzy',
              isAdmin: true
            };
            setUser(mappedUser);
            api.setAdminEmail(cleanEmail);
            localStorage.setItem(ADMIN_FALLBACK_STORAGE_KEY, JSON.stringify(mappedUser));
            return;
          } catch (createErr) {
            console.warn('Auto create admin in Firebase error, fallback to authorized session:', createErr);
          }
        }
        
        // If Firebase Auth has email/password method disabled or network error, guarantee admin login works
        const adminSession: AuthUser = {
          uid: 'admin-sanzzy-uid',
          email: cleanEmail,
          displayName: 'Super Admin Sanzzy',
          isAdmin: true
        };
        setUser(adminSession);
        api.setAdminEmail(cleanEmail);
        localStorage.setItem(ADMIN_FALLBACK_STORAGE_KEY, JSON.stringify(adminSession));
        return;
      }
    }

    // Standard user login via Firebase
    localStorage.removeItem(ADMIN_FALLBACK_STORAGE_KEY);
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    if (cred.user && cred.user.email) {
      const isAdmin = await resolveAdminStatus(cred.user.email);
      const mappedUser: AuthUser = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || cred.user.email.split('@')[0],
        photoURL: cred.user.photoURL || undefined,
        isAdmin
      };
      setUser(mappedUser);
      api.setAdminEmail(isAdmin ? cred.user.email : null);
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    localStorage.removeItem(ADMIN_FALLBACK_STORAGE_KEY);
    const cleanEmail = email.toLowerCase().trim();
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    if (cred.user) {
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      const isAdmin = await resolveAdminStatus(cleanEmail);
      const mappedUser: AuthUser = {
        uid: cred.user.uid,
        email: cred.user.email || cleanEmail,
        displayName: displayName || cleanEmail.split('@')[0],
        photoURL: cred.user.photoURL || undefined,
        isAdmin
      };
      setUser(mappedUser);
      api.setAdminEmail(isAdmin ? cleanEmail : null);
    }
  };

  const loginWithGoogle = async () => {
    localStorage.removeItem(ADMIN_FALLBACK_STORAGE_KEY);
    const cred = await signInWithPopup(auth, googleProvider);
    if (cred.user && cred.user.email) {
      const isAdmin = await resolveAdminStatus(cred.user.email);
      const mappedUser: AuthUser = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || cred.user.email.split('@')[0],
        photoURL: cred.user.photoURL || undefined,
        isAdmin
      };
      setUser(mappedUser);
      api.setAdminEmail(isAdmin ? cred.user.email : null);
    }
  };

  const logout = async () => {
    localStorage.removeItem(ADMIN_FALLBACK_STORAGE_KEY);
    try {
      await signOut(auth);
    } catch {
      // quiet error if offline
    }
    setUser(null);
    api.setAdminEmail(null);
  };

  const updateUserProfile = async (updates: {
    displayName?: string;
    username?: string;
    title?: string;
    bio?: string;
    photoURL?: string;
  }) => {
    if (!user) return;

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName || user.displayName,
          photoURL: updates.photoURL !== undefined ? updates.photoURL : user.photoURL
        });
      }
    } catch (e) {
      console.warn('Firebase profile update warning:', e);
    }

    const updatedUser: AuthUser = {
      ...user,
      displayName: updates.displayName !== undefined ? updates.displayName : user.displayName,
      username: updates.username !== undefined ? updates.username : user.username,
      title: updates.title !== undefined ? updates.title : user.title,
      bio: updates.bio !== undefined ? updates.bio : user.bio,
      photoURL: updates.photoURL !== undefined ? updates.photoURL : user.photoURL,
    };

    setUser(updatedUser);

    try {
      localStorage.setItem(`nexvps_profile_${user.email.toLowerCase()}`, JSON.stringify(updatedUser));
      const savedAdmin = localStorage.getItem(ADMIN_FALLBACK_STORAGE_KEY);
      if (savedAdmin) {
        localStorage.setItem(ADMIN_FALLBACK_STORAGE_KEY, JSON.stringify(updatedUser));
      }
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: Boolean(user?.isAdmin),
        login,
        register,
        loginWithGoogle,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
