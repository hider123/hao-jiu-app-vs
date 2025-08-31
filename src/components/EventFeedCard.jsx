// src/components/EventFeedCard.jsx

import React from 'react';
import VerifiedBadge from './VerifiedBadge'; // 引入我們之前做好的元件
import { ClockIcon, LocationIcon, UsersIcon, SparklesIcon, GlobeIcon } from './Icons'; // 引入所有需要的 Icon

// 我們將原始碼中的 'today' 變數先定義在這裡，確保時間計算邏輯一致
// 注意：這裡使用您原始碼中的固定日期，以確保模擬資料的日期計算結果和之前一樣
const today = new Date('2025-08-24T13:18:00');

export default function EventFeedCard({ event, onEventClick, isRecommended }) {
  const timeLeft = +new Date(event.eventTimestamp) - +today;
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const isToday = new Date(event.eventTimestamp).toDateString() === today.toDateString();

  return (
    // 增加 max-w-md 和 mx-auto 讓卡片在頁面上有個固定的最大寬度且置中
    <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform transform hover:-translate-y-1 cursor-pointer relative max-w-md mx-auto" onClick={() => onEventClick(event)}>
      {isRecommended && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg z-10">
          <SparklesIcon className="w-4 h-4" />
        </div>
      )}
      <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${event.imageUrl})` }}></div>
      <div className="p-5">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>由 {event.creator} 發起</span>
          {event.creatorVerified && <VerifiedBadge isTextVisible={false} />}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mt-1 truncate">{event.title}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4">
          <div className="flex items-center space-x-1">
            <ClockIcon />
            <span>{timeLeft < 0 ? '已結束' : (isToday ? '今天' : `${daysLeft} 天後`)}</span>
          </div>
          {event.eventType === 'in-person' && event.location && (
            <div className="flex items-center space-x-1">
              <LocationIcon />
              <span>{event.location}</span>
            </div>
          )}
          {event.eventType === 'online' && (
            <div className="flex items-center space-x-1">
                <GlobeIcon />
                <span>線上活動</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <UsersIcon className="w-3.5 h-3.5" />
            <span>{event.responses.wantToGo} 人想去</span>
          </div>
        </div>
      </div>
    </div>
  );
}