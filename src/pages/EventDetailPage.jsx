import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEventById, updateEventResponse } from '../firebaseService';
import { BackIcon } from '../components/Icons';

// 倒數計時器元件
const CountdownTimer = ({ targetDate }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const { days, hours, minutes, seconds } = timeLeft;
    const hasTimeLeft = typeof seconds !== 'undefined';

    return (
        <div className="my-4 p-4 bg-slate-50 rounded-xl border">
            {hasTimeLeft ? (
                <div className="flex justify-around items-baseline text-slate-700">
                    {days > 0 && (
                        <div className="text-center">
                            <span className="text-3xl font-bold text-blue-800">{days}</span>
                            <div className="text-xs">天</div>
                        </div>
                    )}
                    <div className="text-center">
                        <span className="text-3xl font-bold text-blue-800">{hours < 10 ? `0${hours}` : hours}</span>
                        <div className="text-xs">時</div>
                    </div>
                    <div className="text-center">
                        <span className="text-3xl font-bold text-blue-800">{minutes < 10 ? `0${minutes}` : minutes}</span>
                        <div className="text-xs">分</div>
                    </div>
                    <div className="text-center">
                        <span className="text-3xl font-bold text-blue-800">{seconds < 10 ? `0${seconds}` : seconds}</span>
                        <div className="text-xs">秒</div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-rose-500 font-semibold py-2">活動已結束</div>
            )}
        </div>
    );
};


export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

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

        // 樂觀更新：立即更新 UI，讓使用者感覺反應迅速
        const originalEvent = { ...event };
        const newEvent = { ...originalEvent };
        const oldResponse = newEvent.responders?.[currentUser.uid]?.response;

        if (oldResponse) {
            if (newEvent.responses[oldResponse] > 0) newEvent.responses[oldResponse]--;
        }
        if (oldResponse === responseType) {
            delete newEvent.responders[currentUser.uid];
        } else {
            newEvent.responders[currentUser.uid] = { response: responseType, nickname: userProfile.profile.nickname };
            newEvent.responses[responseType] = (newEvent.responses[responseType] || 0) + 1;
        }
        setEvent(newEvent);

        // 實際與後端溝通
        const updatedEventData = await updateEventResponse(
            event.id,
            currentUser.uid,
            userProfile.profile.nickname,
            responseType
        );

        // 如果後端更新失敗，則恢復到原始狀態
        if (!updatedEventData) {
            setEvent(originalEvent);
            alert("更新回應失敗，請稍後再試。");
        }
    }, [event, currentUser, userProfile]);

    if (loading) {
        return <div className="p-8 text-center">正在載入活動資料...</div>;
    }

    if (!event) {
        return <div className="p-8 text-center">找不到該活動！</div>;
    }
    
    const userResponse = event?.responders?.[currentUser?.uid]?.response;
    
    const getButtonClass = (responseType) => {
        const baseClass = "flex-1 py-3 px-2 text-sm font-semibold rounded-lg transition-all duration-200 transform";
        if (userResponse === responseType) {
            const selectedClasses = { 
                wantToGo: 'bg-teal-500 text-white scale-105 shadow-lg', 
                interested: 'bg-sky-500 text-white scale-105 shadow-lg', 
                cantGo: 'bg-rose-500 text-white scale-105 shadow-lg' 
            };
            return `${baseClass} ${selectedClasses[responseType]}`;
        }
        return `${baseClass} bg-slate-200 text-slate-800 hover:bg-slate-300`;
    };

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <header className="p-4 bg-white/95 backdrop-blur-sm border-b flex items-center flex-shrink-0 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-indigo-600">
                    <BackIcon />
                </button>
                <h2 className="text-xl font-bold text-gray-800 truncate">活動詳情</h2>
            </header>

            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${event.imageUrl})` }}></div>
                    
                    <div className="p-6 space-y-4">
                        <span className="text-xs font-semibold inline-block py-1 px-3 uppercase rounded-full text-white bg-blue-700">
                            {event.category}
                        </span>
                        <h1 className="text-3xl font-bold text-slate-900">{event.title}</h1>
                        
                        {event.eventTimestamp && <CountdownTimer targetDate={event.eventTimestamp} />}

                        <p className="text-slate-600">{event.description}</p>
                        
                        <div className="border-t pt-4">
                             <p className="text-sm"><strong>發起人：</strong> {event.creator}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                    {userResponse === 'wantToGo' && (
                        <div className="mb-4">
                            <button 
                                onClick={() => navigate(`/event/${event.id}/chat`)}
                                className="w-full py-3 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition shadow-sm"
                            >
                                進入活動聊天室
                            </button>
                        </div>
                    )}
                    <p className="text-center font-semibold text-gray-700 mb-3">您的意願是？</p>
                    <div className="flex justify-around space-x-2 sm:space-x-3">
                        <button onClick={() => handleResponse('wantToGo')} className={getButtonClass('wantToGo')}>想去 ({event.responses.wantToGo})</button>
                        <button onClick={() => handleResponse('interested')} className={getButtonClass('interested')}>有興趣 ({event.responses.interested})</button>
                        <button onClick={() => handleResponse('cantGo')} className={getButtonClass('cantGo')}>沒辦法 ({event.responses.cantGo})</button>
                    </div>
                </div>
            </main>
        </div>
    );
}

