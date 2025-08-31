import React, { useEffect } from 'react';
import { TrophyIcon } from './Icons'; // 確認 Icons.jsx 有 export { TrophyIcon }

const CloseIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function JoinChallengeModal({ isOpen, onClose, onJoinSolo, onStartCreatingTeam }) {
  // 直接受控：使用 props isOpen，避免本地同步邏輯導致問題
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-lg m-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">加入挑戰</h3>
          <button onClick={onClose} aria-label="關閉" className="p-1">
            <CloseIcon />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-700">您可以直接加入或先建立一個小隊與朋友一起參加。</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { onJoinSolo && onJoinSolo(); }}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <TrophyIcon />
              <span>直接加入（單人）</span>
            </button>

            <button
              onClick={() => { onStartCreatingTeam && onStartCreatingTeam(); }}
              className="flex-1 py-3 px-4 border rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
            >
              建立小隊
            </button>
          </div>

          <div className="text-right">
            <button onClick={onClose} className="text-sm text-slate-500 hover:underline">取消</button>
          </div>
        </div>
      </div>
    </div>
  );
}

