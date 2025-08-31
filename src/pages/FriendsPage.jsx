import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addFriend, createGroup } from '../firebaseService'; // 引入後端服務
import { mockSuggestions } from '../data/mockData'; // 好友建議暫時使用模擬資料
import { PlusCircleIcon, UserPlusIcon } from '../components/Icons';
import CreateGroupModal from '../components/CreateGroupModal';

export default function FriendsPage() {
    const { currentUser, userProfile } = useAuth();
    
    // 好友和群組的資料來源是 userProfile，確保資料即時同步
    const friends = userProfile?.friends || [];
    const groups = userProfile?.groups || [];

    // 好友建議需要過濾掉已經是好友的人
    const friendSuggestions = useMemo(() => {
        const friendIds = new Set(friends.map(f => f.id));
        return mockSuggestions.filter(s => !friendIds.has(s.id));
    }, [friends]);

    const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);

    // 注意：在真實應用中，新增好友/群組後，AuthContext 應該要能觸發 userProfile 的重新獲取
    // 為了簡化，我們這裡暫不處理 UI 的即時更新，使用者需要重新整理才能看到新資料
    const handleAddFriend = useCallback(async (newFriend) => {
        if (!currentUser) return;
        const success = await addFriend(currentUser.uid, newFriend);
        if (success) {
            alert(`已成功發送好友邀請給 ${newFriend.nickname}！`);
            // 在真實應用中，我們會更新本地狀態或重新獲取資料
        } else {
            alert("新增好友失敗，請稍後再試。");
        }
    }, [currentUser]);

    const handleCreateGroup = useCallback(async (name, memberIds) => {
        if (!currentUser) return;
        const newGroup = {
            id: `group-${Date.now()}`, // 使用時間戳作為簡單的唯一 ID
            name,
            members: memberIds,
        };
        const success = await createGroup(currentUser.uid, newGroup);
        if (success) {
            alert(`成功建立群組 "${name}"！`);
            setCreateGroupModalOpen(false);
        } else {
            alert("建立群組失敗，請稍後再試。");
        }
    }, [currentUser]);

    const getFriendById = (id) => friends.find(f => f.id === id);

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800">我的社群</h1>
                    <p className="text-slate-500">與您的好友和群組保持聯繫</p>
                </header>

                <main className="space-y-8">
                    {/* Friend Suggestions */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">好友建議</h2>
                        <div className="space-y-3">
                            {friendSuggestions.map(sugg => (
                                <div key={sugg.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <img src={sugg.avatar} className="w-12 h-12 rounded-full" alt={sugg.nickname}/>
                                        <span className="font-semibold text-gray-700">{sugg.nickname}</span>
                                    </div>
                                    <button onClick={() => handleAddFriend(sugg)} className="bg-blue-100 text-blue-800 font-bold text-xs py-2 px-4 rounded-full hover:bg-blue-200 transition flex items-center space-x-2">
                                        <UserPlusIcon className="w-4 h-4"/>
                                        <span>加入</span>
                                    </button>
                                </div>
                            ))}
                            {friendSuggestions.length === 0 && <p className="text-center text-gray-500 py-4">目前沒有好友建議。</p>}
                        </div>
                    </section>

                    {/* My Groups */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">我的群組 ({groups.length})</h2>
                            <button onClick={() => setCreateGroupModalOpen(true)} className="text-blue-800 hover:text-blue-600">
                                <PlusCircleIcon />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {groups.map(group => (
                                <div key={group.id} className="p-3 bg-slate-100 rounded-lg">
                                    <p className="font-bold text-slate-800">{group.name}</p>
                                    <div className="flex -space-x-2 mt-2">
                                        {group.members.map(memberId => {
                                            const member = getFriendById(memberId);
                                            return member ? <img key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={member.avatar} alt={member.nickname}/> : null;
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* My Friends */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">我的好友 ({friends.length})</h2>
                        <div className="space-y-3">
                            {friends.map(friend => (
                                <div key={friend.id} className="flex items-center space-x-4 p-2">
                                    <img src={friend.avatar} className="w-12 h-12 rounded-full" alt={friend.nickname}/>
                                    <span className="font-semibold text-gray-700">{friend.nickname}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
            <CreateGroupModal
                isOpen={isCreateGroupModalOpen}
                onClose={() => setCreateGroupModalOpen(false)}
                friends={friends}
                onCreateGroup={handleCreateGroup}
            />
        </>
    );
}

