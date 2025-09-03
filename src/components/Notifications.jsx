import React, { useState, useEffect, useRef } from 'react';
import { BellIcon } from './Icons';
import { useNavigate } from 'react-router-dom';

// 模擬的通知資料，用於前端 UI 開發
const mockNotifications = [
    { id: 1, type: 'event', message: '王小明 回應了您的活動「駁二攝影團」', link: '/event/3', read: false },
    { id: 2, type: 'challenge', message: '您已成功加入挑戰「夏日港都飲品大挑戰」', link: '/challenge/challenge-1', read: false },
    { id: 3, type: 'event', message: '您建立的活動「一起去看新上映的科幻電影」即將在 1 小時後開始！', link: '/event/1', read: true },
    { id: 4, type: 'system', message: '歡迎加入「好揪」！快來探索您附近的精彩活動吧！', link: '/', read: true },
];

// 通知列表的下拉式選單元件
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
    const [notifications, setNotifications] = useState(mockNotifications);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

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

    const handleNotificationClick = (notification) => {
        // 將通知標示為已讀
        setNotifications(prev => 
            prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        // 關閉下拉選單並跳轉
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

