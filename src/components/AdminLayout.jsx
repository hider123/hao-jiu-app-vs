import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UsersIcon, TrophyIcon } from './Icons';

// 簡單內嵌的日曆圖示
const CalendarIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error("管理員登出失敗:", error);
    }
  };

  const getLinkClass = ({ isActive }) => 
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
      isActive 
        ? 'bg-slate-200 text-slate-900 font-semibold' 
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* 左側導覽列 */}
      <div className="hidden border-r bg-slate-100/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <a href="/admin" className="flex items-center gap-2 font-semibold text-slate-800">
              <span className="">好揪 - 管理後台</span>
            </a>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLink to="/admin/users" className={getLinkClass}>
                <UsersIcon className="h-4 w-4" />
                使用者管理
              </NavLink>
              <NavLink to="/admin/events" className={getLinkClass}>
                <CalendarIcon />
                活動管理
              </NavLink>
              <NavLink to="/admin/challenges" className={getLinkClass}>
                <TrophyIcon className="h-4 w-4" />
                挑戰管理
              </NavLink>
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
             <button onClick={handleLogout} className="w-full py-2 px-4 bg-slate-200 rounded-lg hover:bg-slate-300 text-slate-700 font-semibold">
                登出
             </button>
          </div>
        </div>
      </div>

      {/* 右側主內容區 */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6">
          <h1 className="text-lg font-semibold text-slate-800">儀表板</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto bg-slate-50">
          {/* 子路由對應的頁面 (例如 AdminUsersPage) 將會被渲染在這裡 */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

