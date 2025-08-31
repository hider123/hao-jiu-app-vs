// src/components/WalletCard.jsx
import React from 'react';
import { WalletIcon } from './Icons'; // 引入圖示

export default function WalletCard({ balance }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <WalletIcon className="mr-2 w-6 h-6 text-blue-800"/> 我的錢包
        </h3>
        <span className="font-mono text-2xl font-bold text-blue-800">
          NT$ {balance.toLocaleString()}
        </span>
      </div>
      <div className="flex space-x-2">
        <button className="flex-1 py-2 px-4 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition">儲值</button>
        <button className="flex-1 py-2 px-4 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition">提領</button>
      </div>
    </div>
  );
}