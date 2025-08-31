// src/components/ReputationCard.jsx
import React from 'react';

// 將常數定義移到元件內部或從外部引入，這裡我們先放在內部
const REPUTATION_LEVELS = [
  { level: 1, name: '揪團新手', minScore: 0, nextLevelScore: 100, medal: '🥉' },
  { level: 2, name: '活躍新星', minScore: 100, nextLevelScore: 300, medal: '🥉' },
  { level: 3, name: '資深主揪', minScore: 300, nextLevelScore: 800, medal: '🥈' },
  { level: 4, name: '社群名人', minScore: 800, nextLevelScore: 2000, medal: '🥇' },
  { level: 5, name: '揪團大師', minScore: 2000, nextLevelScore: Infinity, medal: '🏆' },
];

export default function ReputationCard({ reputation }) {
  const currentLevelInfo = REPUTATION_LEVELS.slice().reverse().find(level => reputation >= level.minScore);

  // 處理找不到等級的邊界情況
  if (!currentLevelInfo) {
    return <div>無法載入信譽資料</div>;
  }

  const { name, medal, minScore, nextLevelScore } = currentLevelInfo;
  const progress = nextLevelScore === Infinity ? 100 : Math.round(((reputation - minScore) / (nextLevelScore - minScore)) * 100);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">我的揪團信譽</h3>
      <div className="text-center mb-4">
        <span className="text-5xl">{medal}</span>
        <p className="text-2xl font-bold text-gray-800 mt-2">{name}</p>
      </div>
      <div>
        <div className="flex justify-between items-end mb-1">
          <span className="text-sm font-bold text-blue-800">信譽積分</span>
          <span className="text-sm font-semibold text-gray-600">{reputation} / {nextLevelScore === Infinity ? 'MAX' : nextLevelScore}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};