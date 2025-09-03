import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
// --- 1. 引入我們最新的好友請求函式 ---
import { sendFriendRequest, acceptFriendRequest, declineOrCancelFriendRequest, createGroup } from '../firebaseService';
import { mockSuggestions } from '../data/mockData';
import { PlusCircleIcon, UserPlusIcon, CheckIcon, XIcon } from '../components/Icons';
import CreateGroupModal from '../components/CreateGroupModal';

export default function FriendsPage() {
    const { currentUser, userProfile } = useAuth();
    
    // --- 2. 從 userProfile 中獲取所有社群相關的即時資料 ---
    const friends = userProfile?.friends || [];
    const groups = userProfile?.groups || [];
    const incomingRequests = userProfile?.incomingRequests || [];
    const outgoingRequests = userProfile?.outgoingRequests || [];

    // 從模擬資料中，過濾掉已是好友、或已發送/接收請求的人
    const friendSuggestions = useMemo(() => {
        const friendIds = new Set(friends.map(f => f.id));
        const incomingIds = new Set(incomingRequests.map(r => r.userId));
        const outgoingIds = new Set(outgoingRequests.map(r => r.userId));
        return mockSuggestions.filter(s => 
            !friendIds.has(s.id) && 
            !incomingIds.has(s.id) && 
            !outgoingIds.has(s.id) &&
            s.id !== currentUser?.uid
        );
    }, [friends, incomingRequests, outgoingRequests, currentUser]);

    const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);

    // --- 3. 建立處理所有互動的函式 ---
    const handleSendRequest = useCallback(async (receiver) => {
        if (!currentUser || !userProfile?.profile) return;
        const sender = { uid: currentUser.uid, profile: userProfile.profile };
        const success = await sendFriendRequest(sender, receiver);
        if (success) {
            alert(`已成功發送好友請求給 ${receiver.nickname}！`);
            // 因為 AuthContext 是即時的，UI 會自動更新
        } else {
            alert("發送請求失敗，請稍後再試。");
        }
    }, [currentUser, userProfile]);

    const handleAcceptRequest = useCallback(async (requester) => {
        if (!currentUser || !userProfile?.profile) return;
        const success = await acceptFriendRequest({ uid: currentUser.uid, profile: userProfile.profile }, requester);
        if (success) {
            alert(`已接受 ${requester.nickname} 的好友請求！`);
        } else {
            alert("操作失敗，請稍後再試。");
        }
    }, [currentUser, userProfile]);

    const handleDeclineRequest = useCallback(async (requesterId) => {
        if (!currentUser) return;
        const success = await declineOrCancelFriendRequest(currentUser.uid, requesterId);
        if (success) {
            // UI 會自動更新
        } else {
            alert("操作失敗，請稍後再試。");
        }
    }, [currentUser]);

    const handleCreateGroup = useCallback(async (name, memberIds) => {
        if (!currentUser) return;
        const newGroup = {
            id: `group-${Date.now()}`,
            name,
            members: memberIds,
        };
        const success = await createGroup(currentUser.uid, newGroup);
        if (success) {
            setCreateGroupModalOpen(false);
        } else {
            alert("建立群組失敗，請稍後再試。");
        }
    }, [currentUser]);


    if (!userProfile) {
        return <div className="p-8 text-center">正在載入社群資料...</div>;
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800">我的社群</h1>
                    <p className="text-slate-500">與您的好友和群組保持聯繫</p>
                </header>

                <main className="space-y-8">
                    {/* --- 新增：好友請求區塊 --- */}
                    {incomingRequests.length > 0 && (
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">好友請求 ({incomingRequests.length})</h2>
                            <div className="space-y-3">
                                {incomingRequests.map(req => (
                                    <div key={req.userId} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <img src={req.avatar} className="w-12 h-12 rounded-full" alt={req.nickname}/>
                                            <span className="font-semibold text-gray-700">{req.nickname}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleAcceptRequest(req)} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><CheckIcon /></button>
                                            <button onClick={() => handleDeclineRequest(req.userId)} className="p-2 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200"><XIcon /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

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
                                    <button onClick={() => handleSendRequest(sugg)} className="bg-blue-100 text-blue-800 font-bold text-xs py-2 px-4 rounded-full hover:bg-blue-200 transition flex items-center space-x-2">
                                        <UserPlusIcon className="w-4 h-4"/>
                                        <span>發送請求</span>
                                    </button>
                                </div>
                            ))}
                            {friendSuggestions.length === 0 && <p className="text-center text-gray-500 py-4">目前沒有好友建議。</p>}
                        </div>
                    </section>

                    {/* My Groups & My Friends (保持不變，但現在會顯示即時資料) */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">我的群組 ({groups.length})</h2>
                            <button onClick={() => setCreateGroupModalOpen(true)} className="text-blue-800 hover:text-blue-600"><PlusCircleIcon /></button>
                        </div>
                        {/* ... (群組列表 JSX 保持不變) ... */}
                    </section>

                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">我的好友 ({friends.length})</h2>
                         {/* ... (好友列表 JSX 保持不變) ... */}
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

