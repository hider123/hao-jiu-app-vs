import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEventById, updateEvent, uploadImageAndGetURL } from '../firebaseService';
import { BackIcon, SparklesIcon, MapIcon, GlobeIcon } from '../components/Icons';
import { CATEGORIES } from '../data/mockData';

// 我們重複使用 CreateEventPage 中的 AI 圖片生成函式
const generateImageAI = async (formData) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return null;
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
        if (!response.ok) throw new Error(`API 請求失敗`);
        const result = await response.json();
        return result.predictions?.[0]?.bytesBase64Encoded || null;
    } catch (error) {
        console.error("AI 圖片生成失敗:", error);
        return null;
    }
};

export default function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      setLoading(true);
      const eventData = await getEventById(eventId);
      if (eventData) {
        const eventDate = new Date(eventData.eventTimestamp);
        const date = eventDate.toISOString().split('T')[0];
        const time = eventDate.toTimeString().slice(0, 5);
        setFormData({ ...eventData, eventDate: date, eventTime: time });
      }
      setLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  const handleInputChange = (e) => {
    const { id, value, type } = e.target;
    const finalValue = type === 'number' ? parseInt(value, 10) || 0 : value;
    setFormData(prev => ({ ...prev, [id]: finalValue }));
  };
  
  const handleGenerateImage = useCallback(async () => {
    if (!formData || !currentUser) return;
    setIsGeneratingImage(true);
    const base64Data = await generateImageAI(formData);
    if (base64Data) {
      const storageUrl = await uploadImageAndGetURL(base64Data, currentUser.uid);
      if (storageUrl) {
        setFormData(prev => ({ ...prev, imageUrl: storageUrl }));
      } else {
        alert("圖片上傳失敗，請稍後再試。");
      }
    } else {
        alert("AI 圖片生成失敗，請稍後再試。");
    }
    setIsGeneratingImage(false);
  }, [formData, currentUser]);

  const handleSave = useCallback(async () => {
    if (!formData) return;
    setIsSaving(true);
    const eventTimestamp = new Date(`${formData.eventDate}T${formData.eventTime}`).toISOString();
    
    const dataToUpdate = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      city: formData.city,
      location: formData.location,
      imageUrl: formData.imageUrl,
      eventTimestamp,
      participantLimit: formData.participantLimit,
      fee: formData.fee,
      onlineLink: formData.onlineLink,
      eventType: formData.eventType,
    };

    const success = await updateEvent(eventId, dataToUpdate);
    if (success) {
      alert("活動更新成功！");
      navigate(`/event/${eventId}`);
    } else {
      alert("更新失敗，請稍後再試。");
    }
    setIsSaving(false);
  }, [eventId, formData, navigate]);

  if (loading) return <div className="p-8 text-center">正在載入活動資料...</div>;
  if (!formData) return <div className="p-8 text-center">找不到該活動！</div>;

  return (
    <div className="bg-slate-50 fixed inset-0 flex flex-col">
      <header className="p-4 bg-white/95 backdrop-blur-sm border-b flex items-center flex-shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-indigo-600"><BackIcon /></button>
        <h2 className="text-xl font-bold text-gray-800 truncate">編輯活動</h2>
      </header>
      <main className="flex-grow overflow-y-auto min-h-0 p-4 sm:p-6">
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">活動封面</label>
            <div className="h-48 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden relative">
              {isGeneratingImage ? (
                <div className="text-center text-slate-500">
                    <SparklesIcon className="w-10 h-10 mx-auto animate-pulse" />
                    <p className="mt-2 font-semibold">AI 正在生成新封面...</p>
                </div>
              ) : (
                <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Event Cover" />
              )}
            </div>
            <button onClick={handleGenerateImage} disabled={isGeneratingImage} className="w-full mt-2 py-2 px-4 bg-purple-100 text-purple-800 font-semibold rounded-lg hover:bg-purple-200 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait">
              <SparklesIcon className="w-5 h-5"/>
              {isGeneratingImage ? '生成中...' : 'AI 重新生成封面'}
            </button>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">活動標題</label>
            <input type="text" id="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">活動企劃</label>
            <textarea id="description" value={formData.description} onChange={handleInputChange} rows="6" className="w-full p-3 border border-gray-300 rounded-lg whitespace-pre-wrap"></textarea>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="participantLimit" className="block text-sm font-medium text-gray-700 mb-1">人數限制</label>
              <input type="number" id="participantLimit" value={formData.participantLimit} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" min="0" />
            </div>
            <div>
              <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">活動費用 (元)</label>
              <input type="number" id="fee" value={formData.fee} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" min="0" />
            </div>
          </div>
          <div className="pt-4">
            <button onClick={handleSave} disabled={isSaving} className="w-full py-3 px-4 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition disabled:bg-slate-400">
              {isSaving ? "儲存中..." : "儲存變更"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

