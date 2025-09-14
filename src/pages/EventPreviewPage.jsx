import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addEvent } from '../firebaseService';
import { BackIcon } from '../components/Icons';

export default function EventPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // 從上一個頁面 (CreateEventPage) 透過 state 傳遞過來的活動資料
  const eventData = location.state?.eventData;

  const handlePublish = useCallback(async () => {
    if (!eventData) return;
    setIsLoading(true);
    const newEventId = await addEvent(eventData);
    if (newEventId) {
      alert("活動已成功發佈！");
      navigate(`/event/${newEventId}`);
    } else {
      alert("發佈失敗，請稍後再試。");
      setIsLoading(false);
    }
  }, [eventData, navigate]);

  // 如果因為某些原因（例如重新整理頁面）導致預覽資料遺失，顯示提示
  if (!eventData) {
    return (
      <div className="fixed inset-0 bg-slate-100 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-700">預覽資料遺失</h2>
        <p className="text-slate-500 mt-2">請返回建立頁面重試。</p>
        <button onClick={() => navigate('/create-event')} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg">
            返回建立頁面
        </button>
      </div>
    );
  }
  
  const eventDate = new Date(eventData.eventTimestamp);
  const formattedDate = eventDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = eventDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="bg-slate-50 fixed inset-0 flex flex-col">
      <header className="p-4 bg-white/95 backdrop-blur-sm border-b flex items-center flex-shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-indigo-600">
          <BackIcon />
        </button>
        <h2 className="text-xl font-bold text-gray-800 truncate">活動預覽</h2>
      </header>

      <main className="flex-grow overflow-y-auto">
        <div className="bg-white">
          <div className="relative h-56 bg-slate-200">
            {eventData.imageUrl ? (
              <img 
                src={eventData.imageUrl} 
                alt={eventData.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">（無封面圖片）</p>
              </div>
            )}
          </div>
          
          <div className="p-6 space-y-4">
            <span className="text-xs font-semibold inline-block py-1 px-3 uppercase rounded-full text-white bg-blue-700">
              {eventData.category}
            </span>
            <h1 className="text-3xl font-bold text-slate-900">{eventData.title}</h1>
            
            <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap">{eventData.description || "（無描述）"}</p>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <p className="text-sm"><strong>發起人：</strong> {eventData.creator}</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="p-4 bg-white/95 backdrop-blur-sm border-t flex-shrink-0 flex gap-4">
        <button 
          onClick={() => navigate(-1)}
          disabled={isLoading}
          className="flex-1 py-3 px-4 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition disabled:opacity-50"
        >
          返回修改
        </button>
        <button 
          onClick={handlePublish}
          disabled={isLoading}
          className="flex-1 py-3 px-4 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition disabled:opacity-50"
        >
          {isLoading ? "發佈中..." : "確認發佈"}
        </button>
      </footer>
    </div>
  );
}

