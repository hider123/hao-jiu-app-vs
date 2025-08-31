import React, { useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';

const DatabaseContext = React.createContext();

export function useDatabase() {
  return useContext(DatabaseContext);
}

export function DatabaseProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]); // --- 1. 新增 challenges 的 state ---
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 建立 events 的即時監聽器
    const eventsQuery = query(collection(db, 'events'));
    const unsubscribeEvents = onSnapshot(eventsQuery, (querySnapshot) => {
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
      // 只有在兩個監聽器都至少完成一次後才設定 loading
    }, (error) => {
      console.error("從 Firestore 即時獲取活動失敗:", error);
    });

    // --- 2. 建立 challenges 的即時監聽器 ---
    const challengesQuery = query(collection(db, 'challenges'));
    const unsubscribeChallenges = onSnapshot(challengesQuery, (querySnapshot) => {
      const challengesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChallenges(challengesData);
      setLoading(false); // 將 loading 放在最後一個監聽器中
    }, (error) => {
      console.error("從 Firestore 即時獲取挑戰失敗:", error);
      setLoading(false);
    });


    // 當元件卸載時，取消所有監聽，避免記憶體洩漏
    return () => {
      unsubscribeEvents();
      unsubscribeChallenges();
    };
  }, []);

  const value = {
    events,
    challenges, // --- 3. 將 challenges 也傳遞下去 ---
    loading,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

