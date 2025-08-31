// src/components/VoucherSection.jsx
import React from 'react';
import { TicketIcon } from './Icons'; // 引入圖示

export default function VoucherSection({ vouchers = [] }) { // 加上預設值避免 undefined 錯誤
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <TicketIcon className="mr-2 w-6 h-6 text-amber-500"/> 我的兌換券
      </h3>
      <div className="space-y-3">
        {vouchers.length > 0 ? vouchers.map(voucher => (
          <div key={voucher.id} className="bg-slate-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
            <p className="font-bold text-slate-800">{voucher.name}</p>
            <p className="text-sm text-slate-600">{voucher.description}</p>
            <p className="text-xs text-slate-400 mt-2">有效期限：{voucher.expiry}</p>
          </div>
        )) : (
          <p className="text-center text-gray-500 py-4">目前沒有可用的兌換券。</p>
        )}
      </div>
    </div>
  );
}