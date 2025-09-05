import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { UserIcon, PlusIcon } from './components/Icons';
import NotificationBell from './components/Notifications';
import CustomerSupportMenu from './components/CustomerSupportMenu';

// 頁首元件
const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm z-20 flex-shrink-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">好揪</h1>
        
        <div className="flex items-center gap-2">
          <NotificationBell />
          <CustomerSupportMenu />
          <button
            onClick={() => navigate('/profile')}
            className="text-slate-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-slate-100"
            aria-label="我的帳號"
          >
            <UserIcon />
          </button>
        </div>
      </div>
    </header>
  );
};


export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation(); // 獲取當前路由位置

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <Header />
      
      <main className="flex-grow">
        {/* 子路由對應的頁面將會被渲染在這裡 */}
        <Outlet />
      </main>

      <BottomNav />
      
      {/* 根據不同頁面，智慧顯示對應的「+」按鈕 */}
      {location.pathname === '/' && (
        <button
          onClick={() => navigate('/create-event')}
          className="fixed bottom-20 right-6 bg-blue-800 text-white rounded-full p-4 shadow-lg hover:bg-blue-900 transition-transform transform hover:scale-110 focus:outline-none z-40"
          aria-label="發起新邀約"
        >
          <PlusIcon />
        </button>
      )}

      {location.pathname === '/challenges' && (
        <button
          onClick={() => navigate('/create-challenge')}
          className="fixed bottom-20 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-110 focus:outline-none z-40"
          aria-label="發起新挑戰"
        >
          <PlusIcon />
        </button>
      )}
    </div>
  );
}

