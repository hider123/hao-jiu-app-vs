import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useNavigate } from 'react-router-dom';
import MyAccountPage from './MyAccountPage'; 
import { EditIcon } from '../components/Icons';

export default function ProfilePage() {
  // 從 AuthContext 獲取使用者資料、載入狀態和登出函式
  const { userProfile, loading: authLoading, logout } = useAuth();
  // 從 DatabaseContext 獲取活動列表和載入狀態
  const { events, loading: eventsLoading } = useDatabase();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); 
    } catch (error) {
      console.error("登出失敗:", error);
    }
  };

  // 確保兩種資料都載入完畢
  if (authLoading || eventsLoading) {
    return (
        <div className="flex justify-center items-center p-8 h-full">
            <p className="text-slate-500">正在載入使用者資料...</p>
        </div>
    );
  }

  // 如果載入完畢但找不到使用者資料，顯示提示
  if (!userProfile) {
    return (
        <div className="flex flex-col justify-center items-center p-8 h-full">
            <p className="text-slate-500">無法載入使用者資料，請重新登入。</p>
            <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                前往登入
            </button>
        </div>
    );
  }

  return (
    <div className="bg-slate-100">
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* 使用者基本資訊卡片 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-4">
            <img 
              src={`https://i.pravatar.cc/80?u=${userProfile.email}`} 
              className="w-20 h-20 rounded-full" 
              alt={userProfile.profile?.nickname} 
            />
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-gray-800">{userProfile.profile?.nickname}</h2>
              <p className="text-sm text-gray-600">{userProfile.profile?.bio}</p>
            </div>
            {/* 編輯按鈕，點擊後導航到編輯頁面 */}
            <button 
              onClick={() => navigate('/profile/edit')}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-slate-100"
            >
              <EditIcon />
            </button>
          </div>
        </div>
        
        {/* 嵌入包含頁籤的 MyAccountPage 元件，並傳入所需資料 */}
        <MyAccountPage 
          userProfile={userProfile} 
          events={events} 
        />
        
        {/* 登出按鈕 */}
        <div className="pt-4">
          <button 
            onClick={handleLogout} 
            className="w-full max-w-md mx-auto block py-3 px-4 bg-rose-500 text-white font-bold rounded-lg shadow-lg hover:bg-rose-600 transition"
          >
            登出
          </button>
        </div>
      </main>
    </div>
  );
}

