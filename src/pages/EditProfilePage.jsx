import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../firebaseService';
import { BackIcon } from '../components/Icons';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  
  // 初始化表單狀態為目前的使用者資料
  const [profileData, setProfileData] = useState(userProfile?.profile || {});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    
    const success = await updateUserProfile(currentUser.uid, profileData);
    if (success) {
      await refreshUserProfile(); // 更新全域狀態
      alert("個人資料已儲存！");
      navigate('/profile'); // 返回個人檔案頁
    } else {
      alert("儲存失敗，請稍後再試。");
    }
    setLoading(false);
  }, [currentUser, profileData, refreshUserProfile, navigate]);

  if (!userProfile) {
    return <div className="p-8 text-center">正在載入資料...</div>;
  }

  return (
    <div className="bg-slate-50 fixed inset-0 flex flex-col">
      <header className="p-4 bg-white/95 backdrop-blur-sm border-b flex items-center flex-shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-indigo-600"><BackIcon /></button>
        <h2 className="text-xl font-bold text-gray-800 truncate">編輯個人資料</h2>
      </header>

      <main className="flex-grow overflow-y-auto min-h-0 p-4 sm:p-6">
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">暱稱</label>
            <input 
              type="text" 
              id="nickname" 
              value={profileData.nickname || ''} 
              onChange={handleInputChange} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">個人簡介</label>
            <textarea 
              id="bio" 
              value={profileData.bio || ''} 
              onChange={handleInputChange} 
              rows="3" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="一句話介紹你自己吧！"
            ></textarea>
          </div>
          {/* 之後可以加入更多欄位，例如電話、地址等 */}
          
          <div className="pt-4">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition disabled:bg-slate-400"
            >
              {loading ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
