import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800">後台管理儀表板</h1>
      <p className="mt-2 text-slate-600">歡迎回來，管理員！</p>
      <div className="mt-8">
        <Link to="/admin/events" className="text-blue-500 hover:underline">
          管理活動
        </Link>
      </div>
    </div>
  );
}