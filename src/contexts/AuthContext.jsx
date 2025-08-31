import React, { useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { onNewUserCreate, getUserProfile } from '../firebaseService';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. 新增手動刷新使用者資料的函式 ---
  const refreshUserProfile = useCallback(async () => {
    if (currentUser) {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    }
  }, [currentUser]);

  async function signup(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await onNewUserCreate(userCredential.user.uid, email);
      await refreshUserProfile(); // 註冊後也刷新一次
    }
    return userCredential;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    refreshUserProfile, // --- 2. 將刷新函式也傳遞下去 ---
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

