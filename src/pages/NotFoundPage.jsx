// src/pages/NotFoundPage.jsx

import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold text-blue-800">404</h1>
      <h2 className="text-2xl font-semibold text-slate-700 mt-4">頁面不存在</h2>
      <p className="text-slate-500 mt-2">哎呀！您要找的頁面可能已經被外星人綁架了。</p>
      <Link 
        to="/" 
        className="mt-6 px-6 py-2 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition"
      >
        返回首頁
      </Link>
    </div>
  );
}