import React, { useEffect, useState } from 'react';
import { UserPlusIcon } from './Icons';

const CloseIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function CreateGroupModal({ isOpen, onClose, friends = [], onCreateGroup }) {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setGroupName('');
      setSelectedFriends([]);
    }
  }, [isOpen]);

  const handleToggleFriend = (friendId) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreate = () => {
    if (groupName.trim() && selectedFriends.length > 0) {
      onCreateGroup && onCreateGroup(groupName, selectedFriends);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div 
        className="relative w-full max-w-lg bg-white rounded-xl shadow-lg m-4 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-slate-800">建立新群組</h3>
          <button onClick={onClose} aria-label="關閉" className="p-1 text-slate-500 hover:text-slate-800">
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-1">群組名稱</label>
            <input 
              id="group-name"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：電影同好會"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">選擇成員</label>
            <div className="max-h-48 overflow-y-auto space-y-2 p-2 bg-slate-100 rounded-lg border">
              {friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between p-2 bg-white rounded hover:bg-slate-50">
                  <div className="flex items-center">
                    <img src={friend.avatar} className="w-10 h-10 rounded-full mr-3" alt={friend.nickname}/>
                    <span className="text-sm font-semibold text-slate-700">{friend.nickname}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend.id)}
                    onChange={() => handleToggleFriend(friend.id)}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center p-4 border-t bg-slate-50 space-x-3">
          <button onClick={onClose} className="text-sm text-slate-500 hover:underline">取消</button>
          <button 
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedFriends.length === 0}
            className="py-2 px-5 bg-blue-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>建立群組</span>
          </button>
        </div>
      </div>
    </div>
  );
}
