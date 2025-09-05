import React, { useState, useEffect, useRef } from 'react';
import { HeadphonesIcon, XIcon, SendIcon } from './Icons';

export default function CustomerSupportMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '您好！我是好揪 AI 客服，請問有什麼可以為您服務的嗎？' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const menuRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // 點擊選單以外的地方，關閉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: newMessage.trim() };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // 模擬客服回應
    setTimeout(() => {
      const botResponse = { id: Date.now() + 1, sender: 'bot', text: '感謝您的訊息，正在為您轉接專員，請稍候...' };
      setMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 頁首的耳機圖示按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-slate-100"
        aria-label="客服中心"
      >
        <HeadphonesIcon />
      </button>

      {/* 聊天視窗 (下拉式選單) */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 h-[28rem] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border">
          <header className="p-4 bg-slate-100 rounded-t-2xl flex justify-between items-center border-b">
            <h3 className="font-bold text-slate-800">客服中心</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800">
              <XIcon />
            </button>
          </header>
          <main className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-200 text-slate-800 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </main>
          <footer className="p-2 border-t">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="輸入您的問題..."
                className="w-full p-2 border-transparent rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300"
                disabled={!newMessage.trim()}
              >
                <SendIcon className="w-6 h-6" />
              </button>
            </form>
          </footer>
        </div>
      )}
    </div>
  );
}

