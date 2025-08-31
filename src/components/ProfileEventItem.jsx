import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileEventItem({ event, onRate, rated }) {
  const navigate = useNavigate();
  const date = new Date(event.eventTimestamp);
  const isPast = date < new Date();
  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

  // 點擊卡片跳轉到詳情頁
  const handleClick = () => {
    navigate(`/event/${event.id}`);
  };

  // 點擊評價按鈕時，阻止事件冒泡，避免觸發卡片點擊
  const handleRateClick = (e) => {
    e.stopPropagation();
    onRate(event.id);
  };

  return (
    <div 
      className="flex items-center justify-between p-3 bg-slate-100 rounded-lg transition hover:bg-slate-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-grow">
        <p className="font-semibold text-slate-800">{event.title}</p>
        <p className="text-sm text-slate-500">{event.category}</p>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <p className="font-bold text-blue-800">{formattedDate}</p>
        <p className="text-xs text-slate-500">{date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      {isPast && !rated && (
        <button 
          onClick={handleRateClick} 
          className="ml-4 bg-amber-400 text-amber-900 font-bold text-xs py-2 px-3 rounded-full hover:bg-amber-500 transition"
        >
          評價活動
        </button>
      )}
      {isPast && rated && (
        <span className="ml-4 text-xs font-semibold text-slate-400 px-3">已評價</span>
      )}
    </div>
  );
};
