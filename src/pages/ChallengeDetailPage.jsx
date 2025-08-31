import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getChallengeById, updateChallengeTeam, submitTreasurePoint, reviewTreasurePoint } from '../firebaseService';
import { mockFriends } from '../data/mockData'; // 好友列表暫時仍使用模擬資料
import { BackIcon, TrophyIcon } from '../components/Icons';
import JoinChallengeModal from '../components/JoinChallengeModal';
import CreateTeamModal from '../components/CreateTeamModal';
import TreasurePointItem from '../components/TreasurePointItem'; // 引入獨立的任務點元件

export default function ChallengeDetailPage() {
    const { challengeId } = useParams();
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();
    
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isJoinModalOpen, setJoinModalOpen] = useState(false);
    const [isCreateTeamModalOpen, setCreateTeamModalOpen] = useState(false);

    // 當頁面載入時，根據 URL 中的 ID 去 Firestore 獲取挑戰資料
    useEffect(() => {
        const fetchChallenge = async () => {
            if (!challengeId) return;
            setLoading(true);
            const data = await getChallengeById(challengeId);
            setChallenge(data);
            setLoading(false);
        };
        fetchChallenge();
    }, [challengeId]);

    // 將「加入挑戰」的操作連接到 firebaseService
    const handleJoinSolo = useCallback(async () => {
        if (!challenge || !currentUser || !userProfile?.profile) return;
        const newMember = {
            id: currentUser.uid,
            nickname: userProfile.profile.nickname,
            avatar: `https://i.pravatar.cc/80?u=${currentUser.uid}`
        };
        
        const success = await updateChallengeTeam(challenge.id, [newMember]);
        if (success) {
            // 成功後，更新本地狀態以即時反應在畫面上
            setChallenge(prev => ({ ...prev, team: [...prev.team, newMember] }));
        }
        setJoinModalOpen(false);
    }, [challenge, currentUser, userProfile]);

    const handleCreateTeam = useCallback(async (teamMembers) => {
        if (!challenge || !currentUser) return;
        const newTeamMembers = teamMembers.filter(m => !challenge.team.some(tm => tm.id === m.id));
        const success = await updateChallengeTeam(challenge.id, newTeamMembers);
        if (success) {
            setChallenge(prev => ({ ...prev, team: [...prev.team, ...newTeamMembers] }));
        }
        setCreateTeamModalOpen(false);
    }, [challenge, currentUser]);
    
    // 處理任務提交和審核的函式
    const handleUploadSubmission = useCallback(async (pointId) => {
        const photoUrl = prompt("模擬上傳照片：請輸入圖片 URL", "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=800&auto=format&fit=crop");
        if (!photoUrl) return;
        const comment = prompt("請輸入您的心得或備註：", "順利找到！這家超好喝！");

        const submission = { photoUrl, comment };
        const success = await submitTreasurePoint(challengeId, pointId, submission);
        if (success) {
            setChallenge(prev => ({
                ...prev,
                treasurePoints: prev.treasurePoints.map(p => 
                    p.id === pointId ? { ...p, status: 'pending', submission } : p
                )
            }));
            alert("照片已上傳，待主辦人審核！");
        }
    }, [challengeId]);

    const handleReviewSubmission = useCallback(async (pointId, isApproved) => {
        const success = await reviewTreasurePoint(challengeId, pointId, isApproved);
        if (success) {
            setChallenge(prev => ({
                ...prev,
                treasurePoints: prev.treasurePoints.map(p => {
                    if (p.id === pointId) {
                        return { ...p, status: isApproved ? 'completed' : 'locked', submission: isApproved ? p.submission : null };
                    }
                    return p;
                })
            }));
            alert(isApproved ? "已核准！" : "已駁回！");
        }
    }, [challengeId]);

    const openJoinModal = useCallback(() => setJoinModalOpen(true), []);
    const closeJoinModal = useCallback(() => setJoinModalOpen(false), []);
    const openCreateTeamModal = useCallback(() => setCreateTeamModalOpen(true), []);
    const closeCreateTeamModal = useCallback(() => setCreateTeamModalOpen(false), []);
    const handleStartCreatingTeam = useCallback(() => {
        closeJoinModal();
        openCreateTeamModal();
    }, [closeJoinModal, openCreateTeamModal]);

    if (loading) { return <div className="p-8 text-center">正在載入挑戰...</div>; }
    if (!challenge) { return <div className="p-8 text-center">找不到該挑戰！</div>; }

    const isUserInTeam = challenge.team.some(member => member.id === currentUser?.uid);
    const isHost = challenge.creatorId === currentUser?.uid;

    return (
        <>
            <div className="bg-slate-50 fixed inset-0 flex flex-col">
                <header className="p-4 bg-white/95 backdrop-blur-sm border-b flex items-center flex-shrink-0 z-10">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-indigo-600"><BackIcon /></button>
                    <h2 className="text-xl font-bold text-gray-800 truncate">挑戰詳情</h2>
                </header>

                <main className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                        <h1 className="text-3xl font-bold text-slate-900">{challenge.title}</h1>
                        <p className="text-slate-600">{challenge.description}</p>
                        <div className="border-t border-slate-200 pt-4">
                            <p className="text-amber-600 font-semibold">
                                <span className="font-bold text-slate-700">最終獎勵：</span>
                                {challenge.reward}
                            </p>
                        </div>
                    </section>
                    
                    {isUserInTeam && (
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">我的隊伍</h3>
                            <div className="flex items-center space-x-3">
                                {challenge.team.map(member => (
                                    <div key={member.id} className="text-center">
                                        <img src={member.avatar} className="w-14 h-14 rounded-full ring-2 ring-offset-2 ring-blue-300" alt={member.nickname} />
                                        <p className="text-xs mt-2 font-medium text-slate-600">{member.nickname}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <h3 className="text-xl font-bold text-slate-800 mb-4 px-2">任務地點</h3>
                        <div className="space-y-3">
                            {challenge.treasurePoints.map(point => (
                                <TreasurePointItem 
                                    key={point.id} 
                                    point={point}
                                    onUpload={handleUploadSubmission}
                                    onReview={handleReviewSubmission}
                                    isHost={isHost}
                                />
                            ))}
                        </div>
                    </section>
                </main>
                
                {!isUserInTeam && (
                    <footer className="p-4 bg-white/95 backdrop-blur-sm border-t flex-shrink-0">
                        <button
                            onClick={openJoinModal}
                            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                        >
                            <TrophyIcon />
                            <span>立即加入挑戰</span>
                        </button>
                    </footer>
                )}
            </div>

            <JoinChallengeModal 
                isOpen={isJoinModalOpen}
                onClose={closeJoinModal}
                onJoinSolo={handleJoinSolo}
                onStartCreatingTeam={handleStartCreatingTeam}
            />
            <CreateTeamModal 
                isOpen={isCreateTeamModalOpen}
                onClose={closeCreateTeamModal}
                friends={mockFriends}
                currentUser={userProfile ? {id: currentUser.uid, nickname: userProfile.profile.nickname, avatar: `https://i.pravatar.cc/80?u=${currentUser.uid}`} : null}
                onCreateTeam={handleCreateTeam}
            />
        </>
    );
}

