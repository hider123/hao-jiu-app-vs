import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReputationCard from '../components/ReputationCard';
import WalletCard from '../components/WalletCard';
import VoucherSection from '../components/VoucherSection';
import ProfileEventItem from '../components/ProfileEventItem';
// 引入更新使用者資料的 Firebase 服務
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// 頁籤按鈕的子元件
const TabButton = ({ tabName, activeTab, label, onClick }) => {
  const isActive = activeTab === tabName;
  return (
    <button
      onClick={() => onClick(tabName)}
      className={`py-3 px-4 font-semibold text-sm transition-colors w-full ${isActive ? 'border-b-2 border-blue-800 text-blue-800' : 'text-gray-500 hover:text-blue-700'}`}
    >
      {label}
    </button>
  );
};

export default function MyAccountPage({ userProfile, events = [] }) {
  const [activeTab, setActiveTab] = useState('activities');
  // --- 1. 從 useAuth 中獲取 refreshUserProfile 函式 ---
  const { currentUser, refreshUserProfile } = useAuth();
  const [ratedEventIds, setRatedEventIds] = useState([]);

  // 使用 useMemo 進行效能優化，只有在依賴項改變時才重新篩選
  const wantToGoEvents = useMemo(() => events.filter(event => 
    event.responders && event.responders[currentUser?.uid]?.response === 'wantToGo'
  ), [events, currentUser]);
  
  const interestedEvents = useMemo(() => events.filter(event => 
    event.responders && event.responders[currentUser?.uid]?.response === 'interested'
  ), [events, currentUser]);

  // 處理評價活動的函式
  const handleRateEvent = useCallback(async (eventId) => {
    if (!currentUser || !userProfile?.profile) return;
    
    // 更新信譽積分
    const newReputation = (userProfile.profile.reputation || 0) + 30;
    const userRef = doc(db, 'users', currentUser.uid);
    
    try {
      // 將更新後的信譽寫回 Firestore
      await updateDoc(userRef, {
        "profile.reputation": newReputation
      });
      // 在本地狀態中記錄已評價的活動 ID，以更新 UI
      setRatedEventIds(prev => [...prev, eventId]);
      alert("評價成功！信譽 +30");
      
      // --- 2. 在更新成功後，呼叫刷新函式！ ---
      if (refreshUserProfile) {
        await refreshUserProfile();
      }

    } catch (error) {
      console.error("更新信譽失敗:", error);
      alert("評價失敗，請稍後再試。");
    }
  }, [currentUser, userProfile, refreshUserProfile]);

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      {/* 頁籤導覽列 */}
      <div className="flex justify-around border-b">
        <TabButton tabName="activities" activeTab={activeTab} label="我的活動" onClick={setActiveTab} />
        <TabButton tabName="reputation" activeTab={activeTab} label="揪團信譽" onClick={setActiveTab} />
        <TabButton tabName="wallet" activeTab={activeTab} label="我的錢包" onClick={setActiveTab} />
      </div>

      {/* 根據 activeTab 顯示不同內容 */}
      <div className="p-4">
        {activeTab === 'activities' && (
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-gray-700">已報名 ({wantToGoEvents.length})</h3>
            {wantToGoEvents.length > 0 ? (
              wantToGoEvents.map(event => 
                <ProfileEventItem 
                  key={event.id} 
                  event={event} 
                  onRate={handleRateEvent}
                  rated={ratedEventIds.includes(event.id)}
                />
              )
            ) : (
              <p className="text-sm text-gray-500 p-4 text-center">尚無已報名的活動。</p>
            )}

            <h3 className="font-bold text-lg text-gray-700 pt-4">有興趣 ({interestedEvents.length})</h3>
            {interestedEvents.length > 0 ? (
              interestedEvents.map(event => 
                <ProfileEventItem 
                  key={event.id} 
                  event={event}
                  onRate={handleRateEvent}
                  rated={ratedEventIds.includes(event.id)}
                />
              )
            ) : (
              <p className="text-sm text-gray-500 p-4 text-center">尚無感興趣的活動。</p>
            )}
          </div>
        )}

        {activeTab === 'reputation' && userProfile.profile && (
          <ReputationCard reputation={userProfile.profile.reputation} />
        )}

        {activeTab === 'wallet' && userProfile.wallet && (
          <div className="space-y-4">
            <WalletCard balance={userProfile.wallet.balance} />
            <VoucherSection vouchers={userProfile.wallet.vouchers} />
          </div>
        )}
      </div>
    </div>
  );
}

