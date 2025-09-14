import React from 'react';
import { XIcon } from './Icons';

export default function ParticipantListModal({ isOpen, onClose, participants = [] }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-lg transform transition-all flex flex-col"
        style={{ maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b text-center relative flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-800">參加成員 ({participants.length})</h3>
          <button onClick={onClose} className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600">
            <XIcon />
          </button>
        </header>
        
        <main className="flex-grow overflow-y-auto p-6 space-y-4">
          {participants.length > 0 ? (
            participants.map((participant, index) => (
              <div key={index} className="flex items-center space-x-4">
                <img 
                  // 我們暫時使用一個基於暱稱的隨機頭像
                  src={`https://i.pravatar.cc/80?u=${participant.nickname}`} 
                  alt={participant.nickname}
                  className="w-12 h-12 rounded-full"
                />
                <span className="font-semibold text-slate-700">{participant.nickname}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500">目前尚無人報名參加。</p>
          )}
        </main>
      </div>
    </div>
  );
}
