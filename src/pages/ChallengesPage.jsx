import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../contexts/DatabaseContext';
import ChallengeCard from '../components/ChallengeCard';
import { PlusIcon } from '../components/Icons'; // 引入 PlusIcon

export default function ChallengesPage() {
  const navigate = useNavigate();
  const { challenges, loading } = useDatabase();

  const handleChallengeClick = (challenge) => {
    navigate(`/challenge/${challenge.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-lg text-gray-500">正在從雲端載入挑戰...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">探索挑戰</h1>
          <p className="text-slate-500">完成任務，贏得專屬獎勵！</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.length > 0 ? (
            challenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onChallengeClick={handleChallengeClick}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">
              目前沒有任何挑戰活動，快來發起第一個吧！
            </p>
          )}
        </main>
      </div>
      
      {/* 新增的浮動按鈕 */}
      <button
        onClick={() => navigate('/create-challenge')}
        className="fixed bottom-20 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-110 focus:outline-none z-20"
        aria-label="發起新挑戰"
      >
        <PlusIcon />
      </button>
    </div>
  );
}

