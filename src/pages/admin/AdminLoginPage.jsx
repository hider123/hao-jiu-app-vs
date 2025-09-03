import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 登入後直接嘗試跳轉
      await login(email, password);
      // 登入成功後，onAuthStateChanged 會觸發，AuthContext 會更新。
      // 我們直接導向到 /admin，讓 AdminRoute 來做最終的權限檢查。
      navigate('/admin'); 
    } catch (err) {
      // 如果 Firebase 回報帳密錯誤，就在這裡顯示
      setError('登入失敗，請檢查您的帳號密碼。');
      setLoading(false);
    }
    // 成功登入後，頁面會跳轉，不需要再 setLoading(false)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">好揪</h1>
        <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">管理後台登入</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">電子郵件</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">密碼</label>
            <input
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
            className="w-full py-3 px-4 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition disabled:bg-slate-400"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  );
}

