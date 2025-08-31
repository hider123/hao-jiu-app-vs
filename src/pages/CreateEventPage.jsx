import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addEvent } from '../firebaseService';
import { BackIcon } from '../components/Icons';

// 定義活動類別的常數
const CATEGORIES = ["美食", "電影", "運動", "桌遊", "戶外", "科技", "藝文", "其他"];

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    location: '',
    eventDate: '',
    eventTime: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category, location, eventDate, eventTime } = formData;

    if (!title.trim() || !eventDate || !eventTime) {
      setError('標題、日期和時間為必填欄位。');
      return;
    }
    setLoading(true);
    setError('');

    // 合併日期和時間，並轉換為 ISO 格式的字串
    const eventTimestamp = new Date(`${eventDate}T${eventTime}`).toISOString();

    const eventData = {
      title,
      description,
      category,
      location,
      eventTimestamp,
      // 暫時使用 placeholder 圖片，未來可以擴充為上傳功能
      imageUrl: `https://placehold.co/600x400/6366f1/FFFFFF?text=${encodeURIComponent(title)}`,
      eventType: 'in-person', // 預設為實體活動
      city: '高雄市', // 預設城市，未來可改為下拉選擇
    };

    try {
      await addEvent(eventData, { uid: currentUser.uid, profile: userProfile.profile });
      alert('活動建立成功！');
      navigate('/'); // 成功後返回首頁
    } catch (err) {
      setError('建立活動失敗，請稍後再試。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col">
      <header className="p-4 bg-white/80 backdrop-blur-sm border-b flex items-center flex-shrink-0 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-indigo-600">
          <BackIcon />
        </button>
        <h2 className="text-xl font-bold text-gray-800 truncate">發起新活動</h2>
      </header>

      <main className="flex-grow overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg space-y-4 max-w-lg mx-auto">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">標題</label>
            <input id="title" type="text" value={formData.title} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">描述</label>
            <textarea id="description" value={formData.description} onChange={handleChange} rows="4" className="w-full mt-1 p-2 border border-gray-300 rounded-lg"></textarea>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">分類</label>
            <select id="category" value={formData.category} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 rounded-lg">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">地點</label>
            <input id="location" type="text" value={formData.location} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">日期</label>
              <input id="eventDate" type="date" value={formData.eventDate} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 rounded-lg" required />
            </div>
            <div className="flex-1">
              <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700">時間</label>
              <input id="eventTime" type="time" value={formData.eventTime} onChange={handleChange} className="w-full mt-1 p-2 border border-gray-300 rounded-lg" required />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center py-2">{error}</p>}

          <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition disabled:bg-slate-400">
            {loading ? '發佈中...' : '發佈活動'}
          </button>
        </form>
      </main>
    </div>
  );
}
