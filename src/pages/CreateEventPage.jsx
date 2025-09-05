import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addEvent } from '../firebaseService';
import { BackIcon, GlobeIcon, MapIcon } from '../components/Icons';

// 從 mockData 引入 CATEGORIES 常數
import { CATEGORIES } from '../data/mockData';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    eventType: 'in-person',
    location: '',
    city: '高雄市',
    eventDate: '',
    eventTime: '',
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (!currentUser || !userProfile?.profile) {
      alert("無法獲取使用者資訊，請重新登入。");
      return;
    }

    // 將日期和時間合併為一個 ISO 字串
    const eventTimestamp = new Date(`${formData.eventDate}T${formData.eventTime}`).toISOString();

    const newEventData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      imageUrl: `https://placehold.co/600x400/60a5fa/FFFFFF?text=${encodeURIComponent(formData.title.slice(0,10))}`, // 暫用 placeholder
      eventTimestamp,
      city: formData.city,
      location: formData.location,
      eventType: formData.eventType,
      creator: userProfile.profile.nickname,
      creatorId: currentUser.uid,
      creatorVerified: userProfile.profile.faceVerified || false,
      
      // 加入預設的回應和回應者資料
      responses: { wantToGo: 1, interested: 0, cantGo: 0 },
      responders: {
        [currentUser.uid]: {
          response: 'wantToGo',
          nickname: userProfile.profile.nickname
        }
      },
    };

    const newEventId = await addEvent(newEventData);
    if (newEventId) {
      alert("活動建立成功！");
      navigate(`/event/${newEventId}`);
    } else {
      alert("建立活動失敗，請稍後再試。");
    }
  }, [formData, currentUser, userProfile, navigate]);

  return (
    <div className="bg-slate-50 fixed inset-0 flex flex-col">
      <header className="p-4 bg-white/95 backdrop-blur-sm border-b flex items-center flex-shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-indigo-600"><BackIcon /></button>
        <h2 className="text-xl font-bold text-gray-800 truncate">建立新活動</h2>
      </header>
      <main className="flex-grow overflow-y-auto min-h-0 p-4 sm:p-6">
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border space-y-4">
          
          {/* --- 表單的 JSX 內容 --- */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">活動標題</label>
            <input type="text" id="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="為您的活動取個響亮的名稱吧！" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">活動描述</label>
            <textarea id="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="詳細介紹一下活動內容..."></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">活動分類</label>
                <select id="category" value={formData.category} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">城市</label>
                <select id="city" value={formData.city} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg">
                    <option>高雄市</option>
                    <option>台南市</option>
                    <option>台中市</option>
                    <option>台北市</option>
                </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">活動形式</label>
            <div className="flex gap-4">
                <button onClick={() => setFormData(p => ({...p, eventType: 'in-person'}))} className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${formData.eventType === 'in-person' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <MapIcon className="w-5 h-5"/> 實體活動
                </button>
                <button onClick={() => setFormData(p => ({...p, eventType: 'online'}))} className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${formData.eventType === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <GlobeIcon className="w-5 h-5"/> 線上活動
                </button>
            </div>
          </div>

          {formData.eventType === 'in-person' && (
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">詳細地點</label>
                <input type="text" id="location" value={formData.location} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="例如：駁二藝術特區 C5 倉庫" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input type="date" id="eventDate" value={formData.eventDate} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
                <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-1">時間</label>
                <input type="time" id="eventTime" value={formData.eventTime} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSubmit}
              className="w-full py-3 px-4 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition"
            >
              發佈活動
            </button>
          </div>
          
        </div>
      </main>
    </div>
  );
}

