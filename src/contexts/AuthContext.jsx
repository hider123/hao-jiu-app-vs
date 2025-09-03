import React, { useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebaseConfig'; // 直接從 firebaseConfig 引入 db
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { onNewUserCreate, getUserProfile } from '../firebaseService';
import { doc, onSnapshot } from 'firebase/firestore'; // 引入 onSnapshot

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // login, logout, signup 函式保持不變
  const login = useCallback(async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    if (user) { return await getUserProfile(user.uid); }
    return null;
  }, []);

  const logout = useCallback(() => {
    setUserProfile(null);
    return signOut(auth);
  }, []);
  
  const signup = useCallback(async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await onNewUserCreate(userCredential.user.uid, email);
    }
    return userCredential;
  }, []);

  // --- 關鍵修改：使用 onSnapshot 建立即時監聽 ---
  useEffect(() => {
    // onAuthStateChanged 監聽登入狀態的變化
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        // 如果使用者登出，清空 profile 並結束載入
        setUserProfile(null);
        setLoading(false);
      }
    });

    // 清理 auth 監聽器
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // 如果沒有使用者登入，就不用監聽 profile
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    
    // onSnapshot 會在文件資料有任何變動時，自動觸發並回傳最新的資料
    const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data());
      } else {
        setUserProfile(null);
      }
      // 確保在首次獲取到 profile 資料後，才結束載入狀態
      if (loading) setLoading(false);
    }, (error) => {
      console.error("監聽使用者資料失敗:", error);
      setLoading(false);
    });

    // 清理 profile 監聽器
    return () => unsubscribeProfile();

  }, [currentUser]); // 這個 effect 會在 currentUser 改變時 (登入/登出) 重新執行

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

