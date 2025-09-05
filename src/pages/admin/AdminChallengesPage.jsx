import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { deleteChallenge } from '../../firebaseService';

// 簡單內嵌的刪除圖示
const Trash2Icon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

export default function AdminChallengesPage() {
    const { challenges, loading } = useDatabase();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredChallenges = useMemo(() => {
        if (!challenges) return [];
        return challenges.filter(challenge => 
            challenge.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [challenges, searchTerm]);

    const handleDelete = async (challengeId, challengeTitle) => {
        if (window.confirm(`您確定要永久刪除挑戰「${challengeTitle}」嗎？這個操作無法復原。`)) {
            const success = await deleteChallenge(challengeId);
            if (success) {
                alert("挑戰已成功刪除。");
            } else {
                alert("刪除失敗，請查看主控台錯誤訊息。");
            }
        }
    };

    if (loading) {
        return <div className="text-center">正在載入所有挑戰...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md border">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">挑戰列表 ({filteredChallenges.length})</h2>
                <input 
                    type="text"
                    placeholder="搜尋挑戰標題..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-xs p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">挑戰標題</th>
                            <th className="px-6 py-3">獎勵</th>
                            <th className="px-6 py-3">任務點數量</th>
                            <th className="px-6 py-3">隊伍數量</th>
                            <th className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredChallenges.map(challenge => (
                            <tr key={challenge.id} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium">{challenge.title}</td>
                                <td className="px-6 py-4">{challenge.reward}</td>
                                <td className="px-6 py-4">{challenge.treasurePoints?.length || 0}</td>
                                <td className="px-6 py-4">{challenge.team?.length || 0}</td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => handleDelete(challenge.id, challenge.title)}
                                        className="text-rose-500 hover:text-rose-700 p-1"
                                        aria-label="刪除挑戰"
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
