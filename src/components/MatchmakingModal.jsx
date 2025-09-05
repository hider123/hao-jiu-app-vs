import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './Icons';
import { mockSuggestions } from '../data/mockData'; // 我們將從模擬資料中推薦使用者

// 簡單內嵌的關閉圖示
const CloseIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MatchmakingModal({ isOpen, onClose, event }) {
  const [isSearching, setIsSearching] = useState(true);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setIsSearching(true);
      // 模擬 AI 搜尋 2 秒鐘
      const timer = setTimeout(() => {
        // 簡單的模擬邏輯：隨機從建議列表中挑選 2 位
        const foundMatches = [...mockSuggestions].sort(() => 0.5 - Math.random()).slice(0, 2);
        setMatches(foundMatches);
        setIsSearching(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, event]);

  if (!isOpen) return null;

  const handleInvite = (match) => {
    alert(`已向 ${match.nickname} 發送匿名邀請！\n(此功能待串接聊天室)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div 
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 space-y-4 text-center transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="關閉" className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600">
            <CloseIcon />
        </button>

        {isSearching ? (
          <>
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
              <div className="absolute inset-2 rounded-full border-4 border-purple-200 border-dashed opacity-50 animate-spin-slow"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <SparklesIcon className="w-12 h-12 text-purple-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mt-4">AI 正在為您配對...</h3>
            <p className="text-sm text-gray-500">正在尋找和您一樣對「{event.category}」感興趣的夥伴！</p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-800">為您找到最合適的夥伴！</h3>
            {matches.length > 0 ? (
              <div className="space-y-4 pt-4 text-left">
                {matches.map(match => (
                  <div key={match.id} className="flex items-center space-x-4 p-3 bg-slate-100 rounded-lg">
                    <img src={match.avatar} className="w-14 h-14 rounded-full" alt={match.nickname}/>
                    <div className="flex-grow">
                      <p className="font-bold text-gray-800">{match.nickname}</p>
                      <p className="text-xs text-purple-600 font-semibold">共同興趣：{event.category}</p>
                    </div>
                    <button onClick={() => handleInvite(match)} className="bg-purple-500 text-white font-bold text-xs py-2 px-3 rounded-full hover:bg-purple-600 transition">
                      匿名邀請
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 pt-4">哎呀，暫時沒有找到合適的夥伴。</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
