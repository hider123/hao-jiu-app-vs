import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // 引入 useAuth 來獲取真實資料
import { db } from '../firebaseConfig'; // 引入 db 以便更新文件
import { doc, updateDoc } from 'firebase/firestore'; // 引入更新文件的函式
import { BellIcon } from './Icons';

// 通知列表的下拉式選單元件 (保持不變)
const NotificationDropdown = ({ notifications, onNotificationClick }) => {
    return (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border z-50">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-slate-800">通知</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(notification => (
                    <div 
                        key={notification.id} 
                        onClick={() => onNotificationClick(notification)}
                        className={`p-4 border-b last:border-b-0 hover:bg-slate-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                    >
                        <p className="text-sm text-slate-700">{notification.message}</p>
                    </div>
                )) : (
                    <p className="p-4 text-sm text-center text-slate-500">目前沒有任何通知。</p>
                )}
            </div>
        </div>
    );
};


// 鈴鐺圖示與主邏輯元件
export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    // --- 1. 從 Context 獲取真實的 notifications 和 currentUser ---
    const { currentUser, notifications } = useAuth(); 
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // 計算未讀通知的數量
    const unreadCount = notifications.filter(n => !n.read).length;

    // 點擊鈴鐺以外的地方，關閉下拉選單
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // 點擊通知時的處理函式
    const handleNotificationClick = async (notification) => {
        // --- 2. 將通知在 Firestore 中標示為已讀 ---
        // 只有在通知是未讀狀態時才執行更新
        if (currentUser && !notification.read) {
            const notifRef = doc(db, 'users', currentUser.uid, 'notifications', notification.id);
            try {
                await updateDoc(notifRef, { read: true });
            } catch (error) {
                console.error("更新通知狀態失敗:", error);
            }
        }
        
        // 關閉下拉選單並跳轉到對應連結
        setIsOpen(false);
        navigate(notification.link);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-slate-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-slate-100"
                aria-label="通知"
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <NotificationDropdown 
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                />
            )}
        </div>
    );
}

