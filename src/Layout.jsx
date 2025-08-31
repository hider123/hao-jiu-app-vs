import { Outlet, useNavigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { UserIcon } from './components/Icons'; // 引入使用者圖示

// 頁首元件
const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm z-20 flex-shrink-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">好揪</h1>
        <button
          onClick={() => navigate('/profile')}
          className="text-slate-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-slate-100"
          aria-label="我的帳號"
        >
          <UserIcon />
        </button>
      </div>
    </header>
  );
};


export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <Header />
      
      {/* flex-grow 讓主要內容區域填滿剩餘的所有空間 */}
      <main className="flex-grow">
        {/* 子路由對應的頁面元件將會被渲染在這裡 */}
        <Outlet />
      </main>

      {/* 底部導覽列 */}
      <BottomNav />
    </div>
  );
}
