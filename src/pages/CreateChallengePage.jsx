import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addChallenge } from '../firebaseService';
import { BackIcon, SparklesIcon, EditIcon } from '../components/Icons';
import ChallengeCard from '../components/ChallengeCard';

// 模擬 AI 生成任務點的服務
const mockAIService = (prompt) => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (prompt.includes("高雄") && prompt.includes("美食")) {
        resolve([
          { name: "鹽埕鴨肉珍", clue: "尋找那間總是大排長龍，以煙燻鴨肉聞名的老店。", lat: 22.6255, lng: 120.2823 },
          { name: "下一鍋水煎包", clue: "在市場旁，找到那家只賣下午時段，金黃酥脆的水煎包。", lat: 22.6283, lng: 120.2811 },
          { name: "李家圓仔冰", clue: "走進巷弄，品嚐一碗超過一甲子的手工湯圓冰。", lat: 22.6271, lng: 120.2835 }
        ]);
      } else {
        resolve([
          { name: "AI 推薦點 1", clue: "AI 正在思考一個絕妙的線索...", lat: 22.620, lng: 120.288 },
          { name: "AI 推薦點 2", clue: "這個地點充滿了驚喜與挑戰！", lat: 22.615, lng: 120.305 },
        ]);
      }
    }, 1500);
  });
};

export default function CreateChallengePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedChallenge, setGeneratedChallenge] = useState(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !currentUser) return;
    setIsGenerating(true);
    setGeneratedChallenge(null);

    const pointsData = await mockAIService(prompt);
    const treasurePoints = pointsData.map((p, index) => ({
      id: `ai-tp-${index}-${Date.now()}`,
      name: p.name,
      clue: p.clue,
      status: 'locked',
      lat: p.lat,
      lng: p.lng,
      submission: null
    }));

    const newChallenge = {
      creatorId: currentUser.uid,
      title: `AI生成：${prompt}`,
      description: `這是一場由 AI 根據「${prompt}」主題精心策劃的挑戰。快來探索未知的驚喜，完成所有任務，贏得最終大獎！`,
      reward: '神秘 AI 認證徽章',
      eventTimestamp: new Date(Date.now() + 86400000 * 10).toISOString(),
      imageUrl: `https://placehold.co/600x400/6d28d9/FFFFFF?text=${encodeURIComponent(prompt.slice(0, 10))}`,
      treasurePoints,
      team: []
    };
    setGeneratedChallenge(newChallenge);
    setIsGenerating(false);
  }, [prompt, currentUser]);

  const handlePublish = useCallback(async () => {
    if (!generatedChallenge) return;
    const challengeId = await addChallenge(generatedChallenge);
    if (challengeId) {
      alert("挑戰發佈成功！");
      navigate(`/challenge/${challengeId}`);
    } else {
      alert("發佈失敗，請稍後再試。");
    }
  }, [generatedChallenge, navigate]);

  return (
    <div className="bg-slate-50 fixed inset-0 flex flex-col">
      <header className="p-4 bg-white/95 backdrop-blur-sm border-b flex items-center flex-shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-indigo-600"><BackIcon /></button>
        <h2 className="text-xl font-bold text-gray-800 truncate">AI 挑戰策劃師</h2>
      </header>

      <main className="flex-grow overflow-y-auto min-h-0 p-4 sm:p-6 space-y-6">
        {!generatedChallenge && !isGenerating && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <h3 className="text-2xl font-bold text-gray-800">想辦一場什麼樣的挑戰？</h3>
            <p className="text-gray-600">只要告訴 AI 你的想法，它就能為你生成一份完整的挑戰企劃！</p>
            <div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="例如：我想辦一個關於高雄老鹽埕美食的挑戰"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <SparklesIcon />
              <span>讓 AI 生成挑戰</span>
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="text-center p-10">
             <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-ping"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <SparklesIcon className="w-10 h-10 text-purple-500" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mt-6">AI 正在為您規劃最棒的挑戰...</h3>
          </div>
        )}
        
        {generatedChallenge && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800">AI 已為您生成挑戰預覽！</h3>
            <ChallengeCard challenge={generatedChallenge} onChallengeClick={() => {}} />
            <div className="flex space-x-2 pt-4">
              <button onClick={() => setGeneratedChallenge(null)} className="flex-1 py-3 px-4 bg-slate-200 text-slate-800 font-semibold rounded-lg">重新生成</button>
              <button onClick={handlePublish} className="flex-1 py-3 px-4 bg-blue-800 text-white font-semibold rounded-lg">發佈挑戰</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
