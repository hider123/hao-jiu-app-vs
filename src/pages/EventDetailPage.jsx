import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEventById, updateEventResponse } from '../firebaseService';
import { BackIcon, SparklesIcon, TicketIcon, EditIcon, UsersIcon, CalendarIcon, ClockIcon, LocationIcon, GlobeIcon } from '../components/Icons';
import MatchmakingModal from '../components/MatchmakingModal';
import EventTicketModal from '../components/EventTicketModal';
import ParticipantListModal from '../components/ParticipantListModal';

// 倒數計時器元件 (樣式優化)
const CountdownTimer = ({ targetDate }) => {
    const calculateTimeLeft = useCallback(() => {
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
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => { setTimeLeft(calculateTimeLeft()); }, 1000 * 60); // 每分鐘更新一次即可
        return () => clearTimeout(timer);
    });

    if (Object.keys(timeLeft).length === 0) {
        return <div className="text-center text-lg text-rose-600 font-bold p-4 bg-rose-50 rounded-lg">活動已結束</div>;
    }

    return (
        <div className="grid grid-cols-3 gap-4 text-center">
            {timeLeft.days > 0 && (
                <div>
                    <span className="text-4xl font-bold text-blue-800">{timeLeft.days}</span>
                    <div className="text-sm text-slate-500">天</div>
                </div>
            )}
            <div>
                <span className="text-4xl font-bold text-blue-800">{timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours}</span>
                <div className="text-sm text-slate-500">時</div>
            </div>
            <div>
                <span className="text-4xl font-bold text-blue-800">{timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}</span>
                <div className="text-sm text-slate-500">分</div>
            </div>
        </div>
    );
};

// 資訊項目子元件
const InfoItem = ({ icon, label, children }) => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-slate-500">{icon}</div>
        <div>
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="text-base font-medium text-slate-800">{children}</p>
        </div>
    </div>
);

// 主辦人控制面板元件
const CreatorPanel = ({ event, navigate, onShowParticipants }) => {
    const participants = Object.values(event.responders || {}).filter(r => r.response === 'wantToGo');
    return (
        <div className="bg-indigo-50 border-t-4 border-indigo-500 p-6 rounded-b-2xl shadow-inner space-y-4">
            <h3 className="font-bold text-lg text-indigo-800">主辦人控制面板</h3>
            <button 
              onClick={onShowParticipants}
              className="w-full text-left flex items-center gap-3 text-slate-700 p-3 rounded-lg hover:bg-indigo-100 transition"
            >
                <UsersIcon className="w-6 h-6 text-indigo-700" />
                <div>
                    <p className="font-semibold">目前有 {participants.length} 人報名</p>
                    <p className="text-xs text-slate-500">點擊查看完整名單</p>
                </div>
            </button>
            <button 
                onClick={() => navigate(`/event/${event.id}/edit`)}
                className="w-full py-3 px-4 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-sm flex items-center justify-center gap-2"
            >
                <EditIcon className="w-5 h-5" />
                編輯活動
            </button>
        </div>
    );
};

// 參與者互動面板元件
const ParticipantPanel = ({ event, userResponse, onResponse, onOpenMatchmaking, onOpenTicket, navigate }) => {
    const getButtonClass = (responseType) => {
        const baseClass = "flex-1 py-3 px-2 text-base font-semibold rounded-lg transition-all duration-200 transform";
        if (userResponse === responseType) {
            const selectedClasses = { 
                wantToGo: 'bg-teal-500 text-white scale-105 shadow-lg', 
                interested: 'bg-sky-500 text-white scale-105 shadow-lg', 
                cantGo: 'bg-rose-500 text-white scale-105 shadow-lg' 
            };
            return `${baseClass} ${selectedClasses[responseType]}`;
        }
        return `${baseClass} bg-slate-100 text-slate-800 hover:bg-slate-200`;
    };
    const responses = event.responses || { wantToGo: 0, interested: 0, cantGo: 0 };
    return (
        <div className="p-6">
            {userResponse === 'wantToGo' && (
                <div className="mb-4 grid grid-cols-2 gap-3">
                    <button onClick={onOpenTicket} className="w-full py-3 px-4 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition shadow-sm flex items-center justify-center gap-2">
                        <TicketIcon className="w-5 h-5" /> 查看票根
                    </button>
                    <button onClick={() => navigate(`/event/${event.id}/chat`)} className="w-full py-3 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition shadow-sm">
                        進入聊天室
                    </button>
                </div>
            )}
            {!userResponse && (
                <div className="mb-4">
                    <button onClick={onOpenMatchmaking} className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2">
                        <SparklesIcon /><span>AI 幫我找伴</span>
                    </button>
                </div>
            )}
            <p className="text-center font-semibold text-gray-700 mb-3">您的意願是？</p>
            <div className="flex justify-around space-x-2 sm:space-x-3">
                <button onClick={() => onResponse('wantToGo')} className={getButtonClass('wantToGo')}>想去 ({responses.wantToGo})</button>
                <button onClick={() => onResponse('interested')} className={getButtonClass('interested')}>有興趣 ({responses.interested})</button>
                <button onClick={() => onResponse('cantGo')} className={getButtonClass('cantGo')}>沒辦法 ({responses.cantGo})</button>
            </div>
        </div>
    );
};


export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMatchmakingModalOpen, setMatchmakingModalOpen] = useState(false);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return;
            setLoading(true);
            const data = await getEventById(eventId);
            setEvent(data);
            setLoading(false);
        };
        fetchEvent();
    }, [eventId]);
    
    const handleResponse = useCallback(async (responseType) => {
        if (!event || !currentUser || !userProfile?.profile) return;
        const updatedEvent = await updateEventResponse(event.id, currentUser.uid, userProfile.profile.nickname, responseType);
        if (updatedEvent) {
            setEvent(updatedEvent);
        } else {
            alert("更新回應失敗，請稍後再試。");
        }
    }, [event, currentUser, userProfile]);

    if (loading) { return <div className="p-8 text-center">正在載入活動資料...</div>; }
    if (!event) { return <div className="p-8 text-center">找不到該活動！</div>; }
    
    const isCreator = currentUser?.uid === event.creatorId;
    const userResponse = event.responders?.[currentUser?.uid]?.response;
    const participants = Object.values(event.responders || {}).filter(r => r.response === 'wantToGo');
    const eventDate = new Date(event.eventTimestamp);
    const formattedDate = eventDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = eventDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
      <>
        <div className="bg-slate-50 min-h-screen">
            <header className="p-4 bg-white/95 backdrop-blur-sm border-b flex items-center flex-shrink-0 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-indigo-600"><BackIcon /></button>
                <h2 className="text-xl font-bold text-gray-800 truncate">活動詳情</h2>
            </header>

            <main className="p-4 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-56 object-cover" />
                    
                    <div className="p-6 space-y-6">
                        <div>
                            <span className="text-sm font-bold inline-block py-1 px-3 uppercase rounded-full text-white bg-blue-700">
                                {event.category}
                            </span>
                            <h1 className="text-4xl font-bold text-slate-900 mt-2">{event.title}</h1>
                        </div>

                        {event.eventTimestamp && <CountdownTimer targetDate={event.eventTimestamp} />}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-b py-6">
                            <InfoItem icon={<CalendarIcon />} label="活動日期">{formattedDate}</InfoItem>
                            <InfoItem icon={<ClockIcon />} label="活動時間">{formattedTime}</InfoItem>
                            <InfoItem icon={event.eventType === 'online' ? <GlobeIcon /> : <LocationIcon />} label={event.eventType === 'online' ? "活動連結" : "活動地點"}>
                                {event.eventType === 'online' ? <a href={event.onlineLink} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">點擊加入</a> : event.location}
                            </InfoItem>
                            <InfoItem icon={<UsersIcon />} label="發起人">{event.creator}</InfoItem>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">活動企劃</h3>
                            <div className="prose prose-slate max-w-none text-lg">
                                <p className="whitespace-pre-wrap">{event.description}</p>
                            </div>
                        </div>
                    </div>

                    {isCreator ? (
                        <CreatorPanel 
                            event={event} 
                            navigate={navigate} 
                            onShowParticipants={() => setIsParticipantModalOpen(true)}
                        />
                    ) : (
                        <ParticipantPanel 
                            event={event} 
                            userResponse={userResponse}
                            onResponse={handleResponse}
                            onOpenMatchmaking={() => setMatchmakingModalOpen(true)}
                            onOpenTicket={() => setIsTicketModalOpen(true)}
                            navigate={navigate}
                        />
                    )}
                </div>
            </main>
        </div>
        
        <MatchmakingModal isOpen={isMatchmakingModalOpen} onClose={() => setMatchmakingModalOpen(false)} event={event} />
        <EventTicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} event={event} />
        <ParticipantListModal 
            isOpen={isParticipantModalOpen} 
            onClose={() => setIsParticipantModalOpen(false)}
            participants={participants}
        />
      </>
    );
}

