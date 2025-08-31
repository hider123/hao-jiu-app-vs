// src/pages/AuthPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// 引入一個簡單的載入中圖示
const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, login } = useAuth();
  const navigate = useNavigate();

  // 處理 Firebase 錯誤訊息，轉換為更友善的中文提示
  const getFriendlyErrorMessage = (err) => {
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/invalid-email':
        return '電子郵件或密碼錯誤。';
      case 'auth/email-already-in-use':
        return '這個電子郵件已經被註冊了。';
      case 'auth/weak-password':
        return '密碼強度不足，請至少設定 6 個字元。';
      default:
        return '發生未知錯誤，請稍後再試。';
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/'); // 成功後跳轉回首頁
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
        {/* 點擊 Logo 可以返回首頁（如果已登入）或保持在登入頁 */}
        <Link to="/" className="block">
            <h1 className="text-3xl font-bold text-slate-800 text-center mb-4 cursor-pointer">好揪</h1>
        </Link>
        <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">
          {isLogin ? '登入您的帳號' : '建立新帳號'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email-input" className="block text-sm font-medium text-gray-700">電子郵件</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password-input" className="block text-sm font-medium text-gray-700">密碼</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition disabled:bg-slate-400 flex items-center justify-center"
          >
            {loading ? <SpinnerIcon /> : (isLogin ? '登入' : '註冊')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(''); // 切換模式時清除錯誤訊息
            }} 
            className="text-sm text-blue-600 hover:underline"
          >
            {isLogin ? '還沒有帳號？立即註冊' : '已經有帳號了？前往登入'}
          </button>
        </div>
      </div>
    </div>
  );
}