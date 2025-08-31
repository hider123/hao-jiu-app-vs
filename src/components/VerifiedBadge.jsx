// src/components/VerifiedBadge.jsx

import React from 'react';
import { ShieldCheckIcon } from './Icons'; // 從我們剛建立的 Icons.jsx 檔案中引入

// 使用 export default 將這個元件匯出
export default function VerifiedBadge({ isTextVisible = true, className = '' }) {
  return (
    <div className={`inline-flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-2 py-1 text-xs font-bold shadow-sm ${className}`}>
      <ShieldCheckIcon className="w-4 h-4" />
      {isTextVisible && <span>真人認證</span>}
    </div>
  );
}