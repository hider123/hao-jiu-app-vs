import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { XIcon } from './Icons';

export default function EventTicketModal({ isOpen, onClose, event }) {
  const { currentUser, userProfile } = useAuth();
  const qrCodeRef = useRef(null);

  useEffect(() => {
    if (isOpen && currentUser && event && qrCodeRef.current) {
      // 準備要編碼到 QR Code 中的資料
      const ticketData = JSON.stringify({
        eventId: event.id,
        userId: currentUser.uid,
        eventName: event.title,
      });

      // 使用我們引入的函式庫來生成 QR Code
      try {
        const qr = qrcode(0, 'M');
        qr.addData(ticketData);
        qr.make();
        // 將 QR Code 以 data URL 的形式，設定給 ref 指向的 div
        qrCodeRef.current.innerHTML = qr.createDataURL(6, 10);
      } catch (error) {
        console.error("QR Code 生成失敗:", error);
        qrCodeRef.current.innerHTML = '<p class="text-red-500 text-sm">QR Code 生成失敗</p>';
      }
    }
  }, [isOpen, currentUser, event]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-lg transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b text-center relative">
          <h3 className="text-lg font-semibold text-slate-800">活動票根</h3>
          <button onClick={onClose} className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600">
            <XIcon />
          </button>
        </header>
        
        <main className="p-6 flex flex-col items-center gap-4">
          <div className="text-center">
            <p className="font-semibold text-slate-600">活動名稱</p>
            <h2 className="text-2xl font-bold text-slate-900">{event?.title}</h2>
          </div>
          
          <div 
            ref={qrCodeRef} 
            className="w-56 h-56 bg-slate-100 rounded-lg flex items-center justify-center"
            // 這裡的 innerHTML 會被 useEffect 中的 qr.createDataURL() 取代
          >
            <p className="text-slate-400 text-sm">正在產生 QR Code...</p>
          </div>

          <div className="text-center bg-blue-50 text-blue-800 p-3 rounded-lg w-full">
             <p className="font-semibold">{userProfile?.profile?.nickname}</p>
             <p className="text-xs">{currentUser?.email}</p>
          </div>

          <p className="text-xs text-slate-500 text-center">請在活動入口處向主辦單位出示此 QR Code 以完成報到。</p>
        </main>
      </div>
    </div>
  );
}
