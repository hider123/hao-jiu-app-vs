import React, { useState } from 'react';
import { LockIcon, CheckCircleIcon, ClockIcon, UploadCloudIcon, MessageSquareIcon } from './Icons';

export default function TreasurePointItem({ point, onUpload, onReview, isHost }) {
    const [isClueVisible, setClueVisible] = useState(true); // 預設顯示線索

    // 根據不同狀態定義顯示的資訊
    const statusInfo = {
        locked: { text: '未完成', icon: <LockIcon />, color: 'text-slate-500' },
        pending: { text: '待審核', icon: <ClockIcon className="w-5 h-5"/>, color: 'text-amber-500' },
        completed: { text: '已完成', icon: <CheckCircleIcon className="w-5 h-5"/>, color: 'text-green-500' },
    };

    const currentStatus = statusInfo[point.status] || statusInfo.locked;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
            {/* 任務點標題和狀態 */}
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800">{point.name}</h4>
                <div className={`flex items-center space-x-2 text-sm font-semibold ${currentStatus.color}`}>
                    {currentStatus.icon}
                    <span>{currentStatus.text}</span>
                </div>
            </div>

            {/* 線索 */}
            <p className="text-sm text-gray-600 p-3 bg-slate-50 rounded-md border italic">"{point.clue}"</p>

            {/* 顯示已提交的內容 */}
            {point.submission && (
                <div className="space-y-2 pt-3 border-t">
                    <img src={point.submission.photoUrl} className="rounded-lg w-full h-auto" alt="Submission photo"/>
                    <div className="flex items-start space-x-2 text-sm bg-slate-100 p-3 rounded-lg">
                        <MessageSquareIcon className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5"/>
                        <p className="text-slate-700">{point.submission.comment}</p>
                    </div>
                </div>
            )}

            {/* 根據不同狀態和角色顯示不同的互動按鈕 */}
            {point.status === 'locked' && !isHost && (
                <button 
                    onClick={() => onUpload(point.id)} 
                    className="w-full mt-2 py-2 px-4 bg-slate-100 text-slate-800 font-bold rounded-lg shadow-sm hover:bg-slate-200 transition flex items-center justify-center space-x-2"
                >
                    <UploadCloudIcon className="w-5 h-5"/>
                    <span>上傳照片</span>
                </button>
            )}

            {isHost && point.status === 'pending' && (
                <div className="flex space-x-2 pt-3 border-t">
                    <button 
                        onClick={() => onReview(point.id, true)} 
                        className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition"
                    >
                        通過
                    </button>
                    <button 
                        onClick={() => onReview(point.id, false)} 
                        className="flex-1 bg-rose-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-600 transition"
                    >
                        駁回
                    </button>
                </div>
            )}
        </div>
    );
}

