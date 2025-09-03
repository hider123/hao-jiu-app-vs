import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { deleteEvent } from '../../firebaseService';

// 簡單內嵌的刪除圖示
const Trash2Icon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

export default function AdminEventsPage() {
    const { events, loading } = useDatabase();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = useMemo(() => {
        return events.filter(event => 
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.creator.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [events, searchTerm]);

    const handleDelete = async (eventId, eventTitle) => {
        // 在真實應用中，這裡應該使用一個更美觀的確認視窗
        if (window.confirm(`您確定要永久刪除活動「${eventTitle}」嗎？這個操作無法復原。`)) {
            const success = await deleteEvent(eventId);
            if (success) {
                alert("活動已成功刪除。");
                // 因為我們使用了即時監聽器，UI 會自動更新
            } else {
                alert("刪除失敗，請查看主控台錯誤訊息。");
            }
        }
    };

    if (loading) {
        return <div className="text-center">正在載入所有活動...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md border">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">活動列表 ({filteredEvents.length})</h2>
                <input 
                    type="text"
                    placeholder="搜尋活動標題或發起人..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-1/3 p-2 border rounded-lg text-sm"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">活動標題</th>
                            <th className="px-6 py-3">分類</th>
                            <th className="px-6 py-3">發起人</th>
                            <th className="px-6 py-3">想去人數</th>
                            <th className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEvents.map(event => (
                            <tr key={event.id} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium">{event.title}</td>
                                <td className="px-6 py-4">{event.category}</td>
                                <td className="px-6 py-4">{event.creator}</td>
                                <td className="px-6 py-4">{event.responses?.wantToGo || 0}</td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => handleDelete(event.id, event.title)}
                                        className="text-rose-500 hover:text-rose-700 p-1"
                                        aria-label="刪除活動"
                                    >
                                        <Trash2Icon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
