import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { sendMessage } from '../firebaseService';
import { BackIcon, SendIcon } from '../components/Icons';

// 聊天訊息的子元件
const ChatMessage = ({ message, isCurrentUser }) => {
    const bubbleClasses = isCurrentUser 
        ? "bg-blue-600 text-white self-end rounded-l-xl rounded-t-xl" 
        : "bg-white text-gray-800 self-start rounded-r-xl rounded-t-xl";
    const containerClasses = isCurrentUser ? "justify-end" : "justify-start";
    
    return (
        <div className={`flex ${containerClasses} w-full`}>
            <div className={`max-w-xs md:max-w-md p-3 shadow ${bubbleClasses}`}>
                {!isCurrentUser && <p className="text-xs font-bold text-purple-500 mb-1">{message.senderName}</p>}
                <p>{message.text}</p>
            </div>
        </div>
    );
};


export default function ChatPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const chatId = `event-${eventId}`; // 定義聊天室 ID

    // 捲動到底部的函式
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 監聽來自 Firestore 的即時訊息
    useEffect(() => {
        if (!chatId) return;
        
        const messagesCollectionRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesCollectionRef, orderBy("timestamp"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // 將 Firestore 的 Timestamp 物件轉換為 JavaScript 的 Date 物件
                timestamp: doc.data().timestamp?.toDate()
            }));
            setMessages(messagesData);
        });

        return unsubscribe; // 元件卸載時取消監聽
    }, [chatId]);

    // 當有新訊息時，自動捲動到底部
    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        if (newMessage.trim() && currentUser && userProfile) {
            const messageData = {
                senderId: currentUser.uid,
                senderName: userProfile.profile.nickname,
                text: newMessage.trim(),
            };
            const success = await sendMessage(chatId, messageData);
            if (success) {
                setNewMessage('');
            } else {
                alert("發送訊息失敗，請稍後再試。");
            }
        }
    };

    return (
        <div className="bg-slate-100 fixed inset-0 flex flex-col">
            <header className="p-4 bg-white/95 backdrop-blur-sm border-b flex items-center flex-shrink-0 z-10">
                <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-indigo-600"><BackIcon /></button>
                <h2 className="text-xl font-bold text-gray-800 truncate">活動聊天室</h2>
            </header>

            <main className="flex-grow overflow-y-auto min-h-0 p-4 space-y-4">
                {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} isCurrentUser={msg.senderId === currentUser.uid} />
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-2 bg-white border-t flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="輸入訊息..."
                        className="w-full p-3 border-transparent rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={handleSendMessage} 
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        <SendIcon />
                    </button>
                </div>
            </footer>
        </div>
    );
}
