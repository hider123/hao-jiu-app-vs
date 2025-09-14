import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addEvent, uploadImageAndGetURL } from '../firebaseService';
import { BackIcon, GlobeIcon, MapIcon, SparklesIcon } from '../components/Icons';
import { CATEGORIES } from '../data/mockData';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import LocationSearchInput from '../components/LocationSearchInput';

// --- 台灣縣市列表 ---
const TAIWAN_CITIES_FULL = [
  '臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市', 
  '基隆市', '新竹市', '嘉義市', 
  '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', 
  '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', 
  '澎湖縣', '金門縣', '連江縣'
];
// 使用 Set 確保移除 "縣"、"市" 後的列表沒有重複項
const TAIWAN_CITIES_SIMPLE = [...new Set(TAIWAN_CITIES_FULL.map(city => city.replace(/[縣市]/, '')))];

// --- AI 服務 ---

// AI 標題生成服務
const generateTitleAI = (formData, lastTitle) => {
    return new Promise(resolve => {
        const getDayDescription = () => {
            if (!formData.eventDate) return "週末";
            const day = new Date(formData.eventDate).getDay();
            if (day === 5) return "週五放鬆夜";
            if (day >= 6 || day === 0) return "陽光週末";
            return "平日小確幸";
        };
        const titleTemplates = {
            "美食饗宴": [`舌尖上的${formData.city}：${getDayDescription()}美食馬拉松 🍜`, `吃貨集合！${formData.city}隱藏版巷弄美食探店 😋`, `${getDayDescription()}限定！${formData.city}終極味蕾挑戰`, `不只是吃！${formData.city}美食文化深度之旅 🌮`],
            "電影夜": [`${getDayDescription()}電影夜：大銀幕下的感動與震撼 🎬`, `${formData.city}戲院集合！不爆雷主題觀影團`, `光影的魔幻時刻：在${formData.city}看場好電影`, `🍿️ 爆米花準備好了嗎？電影同好會`],
            "運動健身": [`燃燒卡路里！${formData.city}${getDayDescription()}熱血運動會 🏀`, `揮灑汗水的時刻：${formData.city}球類運動揪團`, `${getDayDescription()}來場酣暢淋漓的對決吧！`, `🏃‍♀️ 一起動起來！${formData.city}城市運動家`],
            "戶外踏青": [`走進大自然：${formData.city}近郊秘境探索 🌲`, `${getDayDescription()}的陽光與微風，戶外健行趣`, `向山海出發！${formData.city}戶外冒險團 ⛰️`, `忘掉煩惱，來場${formData.city}${getDayDescription()}森呼吸`],
        };
        let titles = titleTemplates[formData.category] || [`${formData.city}的${formData.category}聚會`];
        // 如果生成的標題與上一個相同，則從列表中移除，再抽一次
        if (titles.length > 1 && lastTitle) {
            titles = titles.filter(t => t !== lastTitle);
        }
        const generatedTitle = titles[Math.floor(Math.random() * titles.length)];
        resolve(generatedTitle);
    });
};

// AI 文字生成服務
const generateDescriptionAI = (formData) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const date = new Date(`${formData.eventDate}T${formData.eventTime}`);
            const formattedDate = date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' });
            const formattedTime = date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: true });
            let goal = "不論是結交新朋友、探索新興趣，還是單純地為生活增添一抹色彩，我們都期待與您一同創造難忘的獨特回憶，分享最真誠的快樂時光！";
            let agenda = "自由交流，輕鬆享受活動氛圍。";
            let notes = "請帶著一顆愉快的心前來！";

            if (formData.category === "電影夜") {
                goal = "您是否也曾被大銀幕上的光影深深吸引？讓我們暫時放下日常的喧囂，一起沉浸在電影的魔幻世界裡，分享那份獨特的感動、緊張與震撼，並在映後暢聊彼此的心得！";
                agenda = `1. 🍿 集合相見歡\n2. 🎬 觀賞電影「${formData.title}」\n3. 🗣️ 映後心得交流（可自由參加）`;
                notes = "建議提早15分鐘到場取票或劃位，電影票請各自購買。";
            } else if (formData.category === "美食饗宴") {
                goal = "這不僅僅是一次聚餐，更是一場味蕾的冒險！我們將帶您穿梭於城市巷弄，一同探索那些地圖上找不到的隱藏版美味，分享食物入口時最純粹的幸福與快樂。";
                agenda = `1. 🚶‍♂️ ${formData.location || formData.city}集合\n2. 🍜 餐廳/店家巡禮\n3. 💬 用美食交流，認識新朋友`;
                notes = "請務必空著肚子來，並準備好您的相機！費用為均分。";
            } else if (formData.category === "運動健身") {
                goal = "是時候喚醒沉睡的身體，感受汗水淋漓的暢快了！無論您是運動健將還是想活動筋骨的新手，都歡迎加入我們，一起在團隊合作中挑戰自我，享受運動帶來的無限活力與樂趣。";
                agenda = `1. 💪 暖身運動\n2. 🏀 主運動項目\n3. 🧘 緩和收操與交流`;
                notes = "請穿著適合運動的服裝與鞋子，並自備毛巾和水。";
            }

            const locationInfo = formData.eventType === 'online' 
              ? `🔗 **活動連結**\n${formData.onlineLink || '(AI 將自動生成)'}\n\n`
              : `📍 **集合地點**\n${formData.location || formData.city}\n\n`;

            const plan = `✨ **活動名稱**\n${formData.title}\n\n` + `🎯 **活動宗旨**\n${goal}\n\n` + `📅 **活動時間**\n${formattedDate} ${formattedTime}\n\n` + locationInfo + `📝 **活動流程**\n${agenda}\n\n` + `👥 **人數限制**\n${formData.participantLimit > 0 ? `${formData.participantLimit} 人` : '無限制'}\n\n` + `💰 **活動費用**\n新台幣 ${formData.fee} 元 ${formData.fee == 0 ? '(免費！)' : ''}\n\n` + `📌 **注意事項**\n${notes}`;
            
            const onlineLink = formData.eventType === 'online' ? `https://meet.google.com/${Math.random().toString(36).substring(2, 12)}` : null;

            resolve({ plan, onlineLink });
        }, 1500);
    });
};

// AI 圖片生成服務
const generateImageAI = async (formData) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  const categoryPrompts = {
    "美食饗宴": "a vibrant, professional photograph of a beautifully arranged gourmet food platter...",
    "電影夜": "a dramatic, artistic movie poster for a film festival...",
    "運動健身": "a dynamic, high-energy action shot of people playing sports...",
    "戶外踏青": "a beautiful, breathtaking landscape photograph of an outdoor activity...",
    "桌遊派對": "a cozy, warm-lit scene of friends happily playing a board game...",
    "科技新知": "a futuristic, technological-themed poster with abstract glowing circuits...",
    "藝文展覽": "an elegant and minimalist poster for an art exhibition...",
    "音樂現場": "a high energy photo of a live music concert with a crowd...",
    "主題學習": "a studious, clean photo of people learning together in a bright room...",
    "寵物聚會": "a cute, heartwarming photo of various pets playing together in a park...",
    "親子時光": "a warm, happy photo of parents and children playing together outdoors...",
    "手作工坊": "a detailed, close-up shot of hands crafting something, like pottery or jewelry...",
    "電玩同樂": "an exciting, neon-lit scene of friends playing video games together on a large screen...",
    "其他": "a colorful and festive party scene with confetti and balloons...",
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

// 地圖視圖更新元件
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function CreateEventPage() {
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        eventType: 'in-person',
        location: '',
        city: '',
        eventDate: '',
        eventTime: '18:00',
        participantLimit: 10,
        fee: 100,
        onlineLink: '',
        lat: 22.62,
        lng: 120.3,
    });
    
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [mapPosition, setMapPosition] = useState([22.62, 120.3]);
    const [lastGeneratedTitle, setLastGeneratedTitle] = useState('');

    const handleInputChange = (e) => {
        const { id, value, type } = e.target;
        const finalValue = type === 'number' ? parseInt(value, 10) || 0 : value;
        setFormData(prev => ({ ...prev, [id]: finalValue }));
    };

    const handlePlaceSelect = (place) => {
        setFormData(prev => ({
            ...prev,
            location: place.name,
            lat: place.lat,
            lng: place.lng,
        }));
        setMapPosition([place.lat, place.lng]);
    };

    const handleGenerateTitle = useCallback(async () => {
        if (!formData.category || (formData.eventType === 'in-person' && !formData.city) || !formData.eventDate) {
            alert("請至少選擇活動分類、城市(實體活動)和日期，AI 才能為您發想標題！");
            return;
        }
        setIsGeneratingTitle(true);
        const generatedTitle = await Promise.resolve(generateTitleAI(formData, lastGeneratedTitle));
        setFormData(prev => ({ ...prev, title: generatedTitle }));
        setLastGeneratedTitle(generatedTitle);
        setIsGeneratingTitle(false);
    }, [formData, lastGeneratedTitle]);

    const handleGenerateDescription = useCallback(async () => {
        if (!formData.title.trim() || !formData.eventDate || !formData.eventTime) {
            alert("請先填寫或生成標題，並確認日期時間！");
            return;
        }
        setIsGeneratingDesc(true);
        const { plan, onlineLink } = await generateDescriptionAI(formData);
        setFormData(prev => ({ ...prev, description: plan, onlineLink: onlineLink || '' }));
        setIsGeneratingDesc(false);
    }, [formData]);

    const handlePreview = useCallback(async () => {
        if (!currentUser || !userProfile?.profile) return alert("無法獲取使用者資訊...");
        if (!formData.title || !formData.description || !formData.category) {
            alert("請填寫所有必填欄位，包括活動分類、標題和企劃！");
            return;
        }

        setIsLoadingPreview(true);
        const base64Data = await generateImageAI(formData);
        let finalImageUrl = `https://placehold.co/600x400/ff0000/FFFFFF?text=Error`;
        
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
    
    const getTodayString = () => {
        const today = new Date();
        const offset = today.getTimezoneOffset();
        const todayWithOffset = new Date(today.getTime() - (offset*60*1000));
        return todayWithOffset.toISOString().split('T')[0];
    };

    const getMaxDateString = () => {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1); // 今年 + 1 年 = 明年
        const maxYearEnd = new Date(maxDate.getFullYear(), 11, 31); // 明年的年底
        const offset = maxYearEnd.getTimezoneOffset();
        const maxDateWithOffset = new Date(maxYearEnd.getTime() - (offset*60*1000));
        return maxDateWithOffset.toISOString().split('T')[0];
    };

    return (
        <div className="bg-slate-50 fixed inset-0 flex flex-col">
            <header className="p-4 bg-white/95 backdrop-blur-sm border-b flex items-center flex-shrink-0 z-10">
                <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-indigo-600"><BackIcon /></button>
                <h2 className="text-xl font-bold text-gray-800 truncate">建立新活動</h2>
            </header>
            <main className="flex-grow overflow-y-auto min-h-0 p-4 sm:p-6">
                <div className="max-w-xl mx-auto space-y-6">
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
                        <fieldset className="space-y-4">
                            <legend className="text-xl font-bold text-slate-800 border-b pb-3 mb-4 w-full">第一步：設定基本資訊</legend>
                            
                            <div>
                                <label className="block text-base font-semibold text-gray-700 mb-2">活動形式</label>
                                <div className="flex gap-4">
                                    <button onClick={() => setFormData(p => ({...p, eventType: 'in-person', onlineLink: ''}))} className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${formData.eventType === 'in-person' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                                        <MapIcon className="w-5 h-5"/> 實體活動
                                    </button>
                                    <button onClick={() => setFormData(p => ({...p, eventType: 'online', location: '', city: ''}))} className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${formData.eventType === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                                        <GlobeIcon className="w-5 h-5"/> 線上活動
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="category" className="block text-base font-semibold text-gray-700 mb-1">活動分類</label>
                                    <select id="category" value={formData.category} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg text-base" required>
                                        <option value="" disabled>請選擇一個分類...</option>
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-base font-semibold text-gray-700 mb-1">城市</label>
                                    <select id="city" value={formData.eventType === 'online' ? '' : formData.city} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-slate-100 text-base" disabled={formData.eventType === 'online'} required={formData.eventType === 'in-person'}>
                                        {formData.eventType === 'online' ? (
                                            <option value="">線上活動無地點</option>
                                        ) : (
                                            <>
                                                <option value="" disabled>請選擇城市...</option>
                                                {TAIWAN_CITIES_SIMPLE.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="eventDate" className="block text-base font-semibold text-gray-700 mb-1">日期</label>
                                    <input type="date" id="eventDate" value={formData.eventDate} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg text-base" required min={getTodayString()} max={getMaxDateString()} />
                                </div>
                                <div>
                                    <label htmlFor="eventTime" className="block text-base font-semibold text-gray-700 mb-1">時間</label>
                                    <input type="time" id="eventTime" value={formData.eventTime} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg text-base" required />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="space-y-4 border-t pt-6">
                             <legend className="text-xl font-bold text-slate-800 border-b pb-3 mb-4 w-full">第二步：AI 協作創作</legend>
                             <div>
                                <label htmlFor="title" className="block text-base font-semibold text-gray-700 mb-1">活動標題</label>
                                <input type="text" id="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg bg-slate-50 text-base" placeholder="由 AI 生成或手動修改..." required />
                                 <button 
                                    onClick={handleGenerateTitle}
                                    disabled={isGeneratingTitle || !formData.category || (formData.eventType === 'in-person' && !formData.city) || !formData.eventDate}
                                    className="w-full mt-2 py-2.5 px-4 bg-purple-100 text-purple-800 font-semibold rounded-lg hover:bg-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>{isGeneratingTitle ? 'AI 發想中...' : 'AI 生成標題'}</span>
                                </button>
                            </div>
                        </fieldset>
                        
                        <fieldset className="space-y-4 border-t pt-6">
                            <legend className="text-xl font-bold text-slate-800 border-b pb-3 mb-4 w-full">第三步：設定詳細資訊</legend>
                            {formData.eventType === 'in-person' && (
                                <div className="space-y-3">
                                    <label htmlFor="location" className="block text-base font-semibold text-gray-700">詳細地點</label>
                                    <LocationSearchInput 
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        onPlaceSelected={handlePlaceSelect}
                                    />
                                    <div className="mt-2 h-64 w-full rounded-lg overflow-hidden border">
                                      <MapContainer center={mapPosition} zoom={15} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                                        <ChangeView center={mapPosition} zoom={15} />
                                        <TileLayer
                                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        {formData.lat && formData.lng && <Marker position={[formData.lat, formData.lng]} />}
                                      </MapContainer>
                                    </div>
                                </div>
                            )}
                            {formData.eventType === 'online' && (
                                <div>
                                    <label htmlFor="onlineLink" className="block text-base font-semibold text-gray-700 mb-1">線上會議連結</label>
                                    <input type="text" id="onlineLink" value={formData.onlineLink} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg bg-slate-100 text-base" placeholder="由 AI 生成或手動輸入" />
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label htmlFor="participantLimit" className="block text-base font-semibold text-gray-700 mb-1">人數限制</label>
                                  <input type="number" id="participantLimit" value={formData.participantLimit} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg text-base" min="0" />
                                </div>
                                <div>
                                  <label htmlFor="fee" className="block text-base font-semibold text-gray-700 mb-1">活動費用 (元)</label>
                                  <input type="number" id="fee" value={formData.fee} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg text-base" min="0" />
                                </div>
                            </div>
                        </fieldset>
                        
                        <fieldset className="space-y-4 border-t pt-6">
                            <legend className="text-xl font-bold text-slate-800 border-b pb-3 mb-4 w-full">第四步：撰寫活動企劃</legend>
                            <textarea id="description" value={formData.description} onChange={handleInputChange} rows="8" className="w-full p-3 border border-gray-300 rounded-lg bg-slate-50 whitespace-pre-wrap text-base" placeholder="您可以自己撰寫，或讓 AI 幫您生成..." required></textarea>
                            <button onClick={handleGenerateDescription} disabled={!formData.title.trim() || isGeneratingDesc} className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                              <SparklesIcon className="w-5 h-5" />
                              <span>{isGeneratingDesc ? 'AI 思考中...' : 'AI 自動生成企劃'}</span>
                            </button>
                        </fieldset>

                        <div className="pt-4">
                            <button onClick={handlePreview} disabled={isLoadingPreview || isGeneratingTitle || isGeneratingDesc} className="w-full py-3.5 px-4 bg-blue-800 text-white font-bold text-lg rounded-lg hover:bg-blue-900 transition flex items-center justify-center disabled:bg-slate-400">
                                {isLoadingPreview ? (<><SparklesIcon className="w-5 h-5 mr-2 animate-spin" />AI 正在生成與上傳...</>) : ('預覽活動')}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

