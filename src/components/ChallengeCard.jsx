import React from 'react';

// 倒數計時器元件（我們之後會從詳情頁把它抽出來共用）
const CountdownTimer = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

  React.useEffect(() => {
    const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 60000); // 每分鐘更新一次即可
    return () => clearTimeout(timer);
  });

  const timerComponents = [];
  if (Object.keys(timeLeft).length === 0) {
    return <span className="text-rose-500 font-semibold">挑戰已結束</span>;
  }

  if (timeLeft.days > 0) {
    timerComponents.push(<span key="d">{timeLeft.days} 天</span>);
  }
  if (timeLeft.hours > 0) {
    timerComponents.push(<span key="h">{timeLeft.hours} 小時</span>);
  }
  timerComponents.push(<span key="m">{timeLeft.minutes} 分</span>);

  return <span className="font-semibold text-slate-700">剩下：{timerComponents.reduce((prev, curr) => [prev, ' ', curr])}</span>;
};


export default function ChallengeCard({ challenge, onChallengeClick }) {
  return (
    <div 
      className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform transform hover:-translate-y-1 cursor-pointer relative" 
      onClick={() => onChallengeClick(challenge)}
    >
      <div className="h-40 bg-cover bg-center relative" style={{backgroundImage: `url(${challenge.imageUrl})`}}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-bold drop-shadow-md">{challenge.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3 h-10 line-clamp-2">{challenge.description}</p>
        <div className="text-xs text-gray-500 border-t pt-3">
          <CountdownTimer targetDate={challenge.eventTimestamp} />
        </div>
      </div>
    </div>
  )
};
