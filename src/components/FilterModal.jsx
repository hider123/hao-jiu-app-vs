import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';

// 篩選按鈕的子元件
const FilterButton = ({ label, value, selectedValue, onSelect }) => {
  const isSelected = value === selectedValue;
  return (
    <button
      onClick={() => onSelect(value)}
      className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
        isSelected
          ? 'bg-blue-800 text-white shadow-lg'
          : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );
};

export default function FilterModal({ isOpen, onClose, filters, onApply, events }) {
  const [tempFilters, setTempFilters] = useState(filters);

  // 當 modal 打開時，同步外部傳入的 filters 狀態
  useEffect(() => {
    setTempFilters(filters);
  }, [isOpen, filters]);

  if (!isOpen) return null;

  // 從所有活動中動態產生城市和分類選項
  const cities = ['全部', ...new Set(events.map(e => e.city).filter(Boolean))];
  const categories = ['全部', ...new Set(events.map(e => e.category).filter(Boolean))];
  const dateRanges = [
    { label: '全部', value: '全部' },
    { label: '今天', value: 'today' },
    { label: '本週末', value: 'weekend' },
  ];

  const handleClear = () => {
    setTempFilters({ city: '全部', dateRange: '全部', category: '全部' });
  };

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };
  
  const handleCategorySelect = (category) => {
    setTempFilters(prev => ({ ...prev, category }));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full bg-white rounded-t-2xl shadow-lg p-6 space-y-4 animate-modal-enter">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">篩選活動</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon /></button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">城市</label>
          <select value={tempFilters.city} onChange={(e) => setTempFilters({...tempFilters, city: e.target.value})} className="w-full appearance-none bg-slate-100 border border-slate-200 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500">
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {dateRanges.map(range => <FilterButton key={range.value} {...range} selectedValue={tempFilters.dateRange} onSelect={(value) => setTempFilters({...tempFilters, dateRange: value})} />)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">熱門標籤</label>
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {categories.map(cat => <FilterButton key={cat} label={cat} value={cat} selectedValue={tempFilters.category} onSelect={handleCategorySelect} />)}
          </div>
        </div>
        
        <div className="flex space-x-2 pt-4">
          <button onClick={handleClear} className="flex-1 py-3 px-4 bg-slate-200 text-slate-800 font-semibold rounded-lg">清除全部</button>
          <button onClick={handleApply} className="flex-1 py-3 px-4 bg-blue-800 text-white font-semibold rounded-lg">查看結果</button>
        </div>
      </div>
    </div>
  );
}

// 簡單的 CSS 動畫
const style = document.createElement('style');
style.innerHTML = `
  @keyframes modal-enter {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  .animate-modal-enter {
    animation: modal-enter 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);
