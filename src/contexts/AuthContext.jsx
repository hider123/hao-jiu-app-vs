import React, { useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { onNewUserCreate, getUserProfile } from '../firebaseService';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    if (user) {
      return await getUserProfile(user.uid);
    }
    return null;
  }, []);

  const logout = useCallback(() => {
    setUserProfile(null);
    setNotifications([]);
    return signOut(auth);
  }, []);
  
  const signup = useCallback(async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await onNewUserCreate(userCredential.user.uid, email);
    }
    return userCredential;
  }, []);

  useEffect(() => {
    // 監聽 Firebase Authentication 的登入狀態變化
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        // 如果使用者登出，清空所有相關資料並結束載入
        setUserProfile(null);
        setNotifications([]);
        setLoading(false);
      }
    });

    // 元件卸載時，取消監聽
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // 如果沒有使用者登入，則不執行任何操作
    if (!currentUser) {
      // 確保在沒有使用者的情況下，loading 狀態也是 false
      if (loading) setLoading(false);
      return;
    }

    // --- 建立對使用者資料文件 (profile) 的即時監聽 ---
    const userDocRef = doc(db, 'users', currentUser.uid);
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
      if (loading) setLoading(false);
    });

    // --- 建立對通知 (notifications) 子集合的即時監聽 ---
    const notificationsQuery = query(collection(db, 'users', currentUser.uid, 'notifications'), orderBy('timestamp', 'desc'));
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (querySnapshot) => {
      const notificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notificationsData);
    });

    // 元件卸載或使用者改變時，清理所有監聽器
    return () => {
      unsubscribeProfile();
      unsubscribeNotifications();
    };

  }, [currentUser]); // 這個 effect 會在 currentUser 改變時 (登入/登出) 重新執行

  const value = {
    currentUser,
    userProfile,
    notifications,
    loading,
    signup,
    login,
    logout,
  };

  // 只有在初始載入結束後，才渲染子元件
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

