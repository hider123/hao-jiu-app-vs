import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addEvent, uploadImageAndGetURL } from '../firebaseService';
import { BackIcon, GlobeIcon, MapIcon, SparklesIcon } from '../components/Icons';
import { CATEGORIES } from '../data/mockData';

// 模擬一個簡單的 AI 描述生成服務
const generateDescriptionAI = (formData) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const date = new Date(`${formData.eventDate}T${formData.eventTime}`);
      const formattedDate = date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' });
      const formattedTime = date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: true });

      let goal = "期待與您一同創造美好的回憶，分享快樂時光！";
      let notes = "請帶著一顆愉快的心前來！";

      if (formData.category === "電影") {
        goal = "一起沉浸在電影的世界裡，分享觀影後的激動心情！";
        notes = "建議提早15分鐘到場取票或劃位。";
      } else if (formData.category === "美食") {
        goal = "一同探索城市中隱藏的美味，分享食物帶來的純粹快樂。";
        notes = "請務必空著肚子來，並準備好您的相機！";
      } else if (formData.category === "運動") {
        goal = "一起揮灑汗水，享受運動帶來的活力與樂趣。";
        notes = "請穿著適合運動的服裝與鞋子，並自備毛巾和水。";
      }

      const locationInfo = formData.eventType === 'online' 
        ? `🔗 **活動連結**\n${formData.onlineLink}\n\n`
        : `📍 **集合地點**\n${formData.location || formData.city}\n\n`;

      const plan = `🎯 **活動宗旨**\n${goal}\n\n` +
                   `⏰ **活動時間**\n${formattedDate} ${formattedTime}\n\n` +
                   locationInfo +
                   `👥 **人數限制**\n${formData.participantLimit > 0 ? `${formData.participantLimit} 人` : '無限制'}\n\n` +
                   `💰 **活動費用**\n新台幣 ${formData.fee} 元 ${formData.fee == 0 ? '(免費！)' : ''}\n\n` +
                   `📌 **注意事項**\n${notes}`;
      
      const onlineLink = formData.eventType === 'online' 
        ? `https://meet.google.com/${Math.random().toString(36).substring(2, 12)}` 
        : null;

      resolve({ plan, onlineLink });
    }, 1500);
  });
};

// 呼叫 Imagen 3 AI 模型的圖片生成服務
const generateImageAI = async (formData) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key 未設定！");
    return null;
  }
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  const categoryPrompts = {
    "美食": "a vibrant, professional photograph of a beautifully arranged gourmet food platter, festive atmosphere, delicious",
    "電影": "a dramatic, artistic movie poster for a film festival, showing a vintage cinema screen and an audience silhouette",
    "運動": "a dynamic, high-energy action shot of people playing sports, motion blur, bright colors",
    "桌遊": "a cozy, warm-lit scene of friends happily playing a board game, with cards and pieces scattered on a wooden table",
    "戶外": "a beautiful, breathtaking landscape photograph of an outdoor activity, like hiking in mountains or kayaking on a lake",
    "科技": "a futuristic, technological-themed poster with abstract glowing circuits and binary code patterns",
    "藝文": "an elegant and minimalist poster for an art exhibition or a classical music concert",
    "其他": "a colorful and festive party scene with confetti and balloons, celebrating an event",
  };
  const mainSubject = categoryPrompts[formData.category] || `an event about ${formData.title}`;
  const prompt = `Professional event poster style, clean design. Main subject: ${mainSubject}. The title of the event is "${formData.title}".`;
  const payload = { instances: [{ prompt }], parameters: { "sampleCount": 1 } };
  try {
    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) { throw new Error(`API 請求失敗，狀態碼: ${response.status}`); }
    const result = await response.json();
    if (result.predictions?.[0]?.bytesBase64Encoded) {
      return result.predictions[0].bytesBase64Encoded;
    } else {
      throw new Error("AI 未能成功生成圖片資料。");
    }
  } catch (error) {
    console.error("AI 圖片生成過程中發生錯誤:", error);
    return null;
  }
};


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
    participantLimit: 10,
    fee: 100,
    onlineLink: '',
  });
  
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const handleInputChange = (e) => {
    const { id, value, type } = e.target;
    const finalValue = type === 'number' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [id]: finalValue }));
  };

  const handleGenerateDescription = useCallback(async () => {
    if (!formData.title.trim() || !formData.eventDate || !formData.eventTime) {
      alert("請至少輸入活動標題、日期和時間，AI 才能為您生成更精準的企劃！");
      return;
    }
    setIsGeneratingDesc(true);
    const { plan, onlineLink } = await generateDescriptionAI(formData);
    setFormData(prev => ({ ...prev, description: plan, onlineLink: onlineLink || '' }));
    setIsGeneratingDesc(false);
  }, [formData]);

  const handlePreview = useCallback(async () => {
    if (!currentUser || !userProfile?.profile) return alert("無法獲取使用者資訊...");
    if (!formData.title || !formData.eventDate || !formData.eventTime || !formData.description) {
      alert("請填寫所有必填欄位，包括活動企劃！");
      return;
    }

    setIsLoadingPreview(true);
    const base64Data = await generateImageAI(formData);
    let finalImageUrl = `https://placehold.co/600x400/ff0000/FFFFFF?text=AI+Error`;

    if (base64Data) {
      const storageUrl = await uploadImageAndGetURL(base64Data, currentUser.uid);
      if (storageUrl) {
        finalImageUrl = storageUrl;
      }
    }

    const eventTimestamp = new Date(`${formData.eventDate}T${formData.eventTime}`).toISOString();
    const eventDataForPreview = {
      ...formData,
      imageUrl: finalImageUrl,
      eventTimestamp,
      creator: userProfile.profile.nickname,
      creatorId: currentUser.uid,
      creatorVerified: userProfile.profile.faceVerified || false,
      responses: { wantToGo: 1, interested: 0, cantGo: 0 },
      responders: { [currentUser.uid]: { response: 'wantToGo', nickname: userProfile.profile.nickname } },
    };
    
    setIsLoadingPreview(false);
    navigate('/create-event/preview', { state: { eventData: eventDataForPreview } });
  }, [formData, currentUser, userProfile, navigate]);

  return (
    <div className="bg-slate-50 fixed inset-0 flex flex-col">
      <header className="p-4 bg-white/95 backdrop-blur-sm border-b flex items-center flex-shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-indigo-600"><BackIcon /></button>
        <h2 className="text-xl font-bold text-gray-800 truncate">建立新活動</h2>
      </header>
      <main className="flex-grow overflow-y-auto min-h-0 p-4 sm:p-6">
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border space-y-4">
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">活動標題</label>
            <input type="text" id="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="為您的活動取個響亮的名稱吧！" required />
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
                <button onClick={() => setFormData(p => ({...p, eventType: 'in-person', onlineLink: ''}))} className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${formData.eventType === 'in-person' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <MapIcon className="w-5 h-5"/> 實體活動
                </button>
                <button onClick={() => setFormData(p => ({...p, eventType: 'online', location: ''}))} className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${formData.eventType === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <GlobeIcon className="w-5 h-5"/> 線上活動
                </button>
            </div>
          </div>

          {formData.eventType === 'in-person' && (
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">詳細地點</label>
                <input type="text" id="location" value={formData.location} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="例如：駁二藝術特區 C5 倉庫" required />
            </div>
          )}
          
          {formData.eventType === 'online' && (
            <div>
                <label htmlFor="onlineLink" className="block text-sm font-medium text-gray-700 mb-1">線上會議連結</label>
                <input 
                  type="text" 
                  id="onlineLink" 
                  value={formData.onlineLink} 
                  onChange={handleInputChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg bg-slate-100" 
                  placeholder="點擊 AI 生成企劃來自動產生連結" 
                  readOnly
                />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input type="date" id="eventDate" value={formData.eventDate} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
            </div>
            <div>
                <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-1">時間</label>
                <input type="time" id="eventTime" value={formData.eventTime} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="participantLimit" className="block text-sm font-medium text-gray-700 mb-1">人數限制</label>
              <input type="number" id="participantLimit" value={formData.participantLimit} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" min="0" />
            </div>
            <div>
              <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">活動費用 (元)</label>
              <input type="number" id="fee" value={formData.fee} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" min="0" placeholder="0 表示免費" />
            </div>
          </div>

          <div className="border-t pt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">活動企劃</label>
            <textarea 
              id="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              rows="6" 
              className="w-full p-3 border border-gray-300 rounded-lg whitespace-pre-wrap" 
              placeholder="您可以自己撰寫，或讓 AI 幫您生成..."
              required
            ></textarea>
            <button 
              onClick={handleGenerateDescription}
              disabled={!formData.title.trim() || !formData.eventDate || !formData.eventTime || isGeneratingDesc}
              className="w-full mt-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>{isGeneratingDesc ? 'AI 思考中...' : 'AI 自動生成企劃'}</span>
            </button>
          </div>

          <div className="pt-4">
            <button 
              onClick={handlePreview}
              disabled={isLoadingPreview}
              className="w-full py-3 px-4 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition flex items-center justify-center disabled:bg-slate-400 disabled:cursor-wait"
            >
              {isLoadingPreview ? (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2 animate-spin" />
                  AI 正在生成與上傳...
                </>
              ) : (
                '預覽活動'
              )}
            </button>
          </div>
          
        </div>
      </main>
    </div>
  );
}

