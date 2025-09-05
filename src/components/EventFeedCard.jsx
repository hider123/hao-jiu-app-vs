import React from 'react';
import VerifiedBadge from './VerifiedBadge';
import { ClockIcon, LocationIcon, UsersIcon, SparklesIcon, GlobeIcon } from './Icons';

// 使用固定的日期來確保模擬資料的時間計算結果一致
const today = new Date('2025-08-24T13:18:00');

export default function EventFeedCard({ event, onEventClick, isRecommended }) {
  // --- 防呆修正 1：確保 event 物件存在 ---
  if (!event) {
    return null; // 如果沒有 event 資料，直接不渲染任何東西
  }

  // --- 防呆修正 2：為可能不存在的資料提供預設值 ---
  const eventTimestamp = event.eventTimestamp || new Date().toISOString();
  const responses = event.responses || { wantToGo: 0 };
  const title = event.title || '無標題活動';
  const creator = event.creator || '匿名使用者';
  
  const timeLeft = +new Date(eventTimestamp) - +today;
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const isToday = new Date(eventTimestamp).toDateString() === today.toDateString();

  return (
    <div 
      className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform transform hover:-translate-y-1 cursor-pointer relative flex flex-col" 
      onClick={() => onEventClick(event)}
    >
      {isRecommended && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg z-10">
          <SparklesIcon className="w-4 h-4" />
        </div>
      )}
      
      <div className="h-32 bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${event.imageUrl || ''})` }}></div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>由 {creator} 發起</span>
          {event.creatorVerified && <VerifiedBadge isTextVisible={false} />}
        </div>
        
        <div className="flex-grow pt-1">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{title}</h3>
        </div>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4 pt-4 border-t flex-shrink-0">
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{timeLeft < 0 ? '已結束' : (isToday ? '今天' : `${daysLeft} 天後`)}</span>
          </div>
          {event.eventType === 'in-person' && event.location && (
            <div className="flex items-center space-x-1">
              <LocationIcon className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          )}
          {event.eventType === 'online' && (
            <div className="flex items-center space-x-1">
                <GlobeIcon className="w-4 h-4" />
                <span>線上活動</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <UsersIcon className="w-4 h-4" />
            {/* --- 防呆修正 3：使用 responses.wantToGo --- */}
            <span>{responses.wantToGo} 人想去</span>
          </div>
        </div>
      </div>
    </div>
  );
}

