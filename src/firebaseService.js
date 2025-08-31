import { db } from './firebaseConfig';
import { 
  doc, setDoc, getDoc, collection, getDocs, runTransaction, 
  arrayUnion, updateDoc, serverTimestamp, addDoc, query, orderBy, writeBatch 
} from 'firebase/firestore';
import { mockProfile, mockWallet, mockChats } from './data/mockData'; 

// --- User Functions ---

export const onNewUserCreate = async (userId, email) => {
  const userRef = doc(db, 'users', userId);
  try {
    await setDoc(userRef, {
      email: email,
      profile: mockProfile,
      wallet: mockWallet,
      friends: [],
      groups: [],
      createdAt: new Date(),
    });
    console.log("新使用者資料已在 Firestore 中建立！");
  } catch (error) {
    console.error("在 Firestore 中建立使用者資料失敗:", error);
  }
};

export const getUserProfile = async (userId) => {
  const userRef = doc(db, 'users', userId);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("獲取使用者資料失敗:", error);
    return null;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  const userRef = doc(db, "users", userId);
  try {
    await updateDoc(userRef, {
      profile: profileData
    });
    console.log(`成功更新使用者 ${userId} 的個人資料！`);
    return true;
  } catch (error) {
    console.error("更新個人資料失敗:", error);
    return false;
  }
};


// --- Event Functions ---

export const getEventById = async (eventId) => {
  const eventRef = doc(db, "events", eventId);
  try {
    const docSnap = await getDoc(eventRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    console.warn(`在 Firestore 中找不到該活動文件！ ID: ${eventId}`);
    return null;
  } catch (error) {
    console.error("獲取單一活動失敗:", error);
    return null;
  }
};

export const updateEventResponse = async (eventId, userId, userNickname, responseType) => {
  const eventRef = doc(db, "events", eventId);
  try {
    return await runTransaction(db, async (transaction) => {
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) { throw "活動文件不存在！"; }
      
      const data = eventDoc.data();
      const newResponders = { ...(data.responders || {}) };
      const newResponses = { ...(data.responses || { wantToGo: 0, interested: 0, cantGo: 0 }) };
      const oldResponse = newResponders[userId]?.response;

      if (oldResponse) {
        if (newResponses[oldResponse] > 0) newResponses[oldResponse]--;
      }
      
      if (oldResponse === responseType) {
        delete newResponders[userId];
      } else {
        newResponders[userId] = { response: responseType, nickname: userNickname };
        newResponses[responseType] = (newResponses[responseType] || 0) + 1;
      }

      transaction.update(eventRef, { responders: newResponders, responses: newResponses });
      return { ...data, responders: newResponders, responses: newResponses };
    });
  } catch (error) {
    console.error("更新活動回應失敗:", error);
    return null;
  }
};

export const addEvent = async (eventData) => {
  try {
    const newDocRef = doc(collection(db, 'events'));
    await setDoc(newDocRef, { ...eventData, id: newDocRef.id });
    return newDocRef.id;
  } catch (error) {
    console.error("建立活動失敗:", error);
    return null;
  }
};


// --- Challenge Functions ---

export const getChallengeById = async (challengeId) => {
  const challengeRef = doc(db, "challenges", challengeId);
  try {
    const docSnap = await getDoc(challengeRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    console.warn(`在 Firestore 中找不到該挑戰文件！ ID: ${challengeId}`);
    return null;
  } catch (error) {
    console.error("獲取單一挑戰失敗:", error);
    return null;
  }
};

export const updateChallengeTeam = async (challengeId, newTeamMembers) => {
  const challengeRef = doc(db, "challenges", challengeId);
  try {
    await updateDoc(challengeRef, { team: arrayUnion(...newTeamMembers) });
    return true;
  } catch (error) {
    console.error("更新挑戰隊伍失敗:", error);
    return false;
  }
};

export const submitTreasurePoint = async (challengeId, pointId, submission) => {
  const challengeRef = doc(db, "challenges", challengeId);
  try {
    const challengeSnap = await getDoc(challengeRef);
    if (challengeSnap.exists()) {
      const challengeData = challengeSnap.data();
      const newPoints = challengeData.treasurePoints.map(p => {
        if (p.id === pointId) {
          return { ...p, status: 'pending', submission };
        }
        return p;
      });
      await updateDoc(challengeRef, { treasurePoints: newPoints });
      return true;
    }
    return false;
  } catch (error) {
    console.error("提交任務點失敗:", error);
    return false;
  }
};

export const reviewTreasurePoint = async (challengeId, pointId, isApproved) => {
    const challengeRef = doc(db, "challenges", challengeId);
    try {
        const challengeSnap = await getDoc(challengeRef);
        if (challengeSnap.exists()) {
            const challengeData = challengeSnap.data();
            const newPoints = challengeData.treasurePoints.map(p => {
                if (p.id === pointId) {
                    const newStatus = isApproved ? 'completed' : 'locked';
                    const newSubmission = isApproved ? p.submission : null;
                    return { ...p, status: newStatus, submission: newSubmission };
                }
                return p;
            });
            await updateDoc(challengeRef, { treasurePoints: newPoints });
            return true;
        }
        return false;
    } catch (error) {
        console.error("審核任務點失敗:", error);
        return false;
    }
};

export const addChallenge = async (challengeData) => {
  try {
    const newDocRef = doc(collection(db, 'challenges'));
    await setDoc(newDocRef, { ...challengeData, id: newDocRef.id });
    return newDocRef.id;
  } catch (error) {
    console.error("建立挑戰失敗:", error);
    return null;
  }
};


// --- Social/Friends Functions ---

export const addFriend = async (currentUserId, newFriend) => {
  const userRef = doc(db, "users", currentUserId);
  try {
    await updateDoc(userRef, { friends: arrayUnion(newFriend) });
    return true;
  } catch (error) {
    console.error("新增好友失敗:", error);
    return false;
  }
};

export const createGroup = async (currentUserId, newGroup) => {
  const userRef = doc(db, "users", currentUserId);
  try {
    await updateDoc(userRef, { groups: arrayUnion(newGroup) });
    return true;
  } catch (error) {
    console.error("建立群組失敗:", error);
    return false;
  }
};


// --- Chat Functions ---

export const sendMessage = async (chatId, messageData) => {
  const messagesCollectionRef = collection(db, "chats", chatId, "messages");
  try {
    await addDoc(messagesCollectionRef, {
      ...messageData,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("發送訊息失敗:", error);
    return false;
  }
};

// --- Seeding Functions (for one-time setup) ---

export const seedEventsToFirestore = async () => {
  const eventsCollectionRef = collection(db, 'events');
  console.log("準備開始填充活動資料到 Firestore...");
  const batch = writeBatch(db);
  const { default: mockEvents } = await import('./data/mockData.js');

  mockEvents.forEach((event) => {
    const docRef = doc(eventsCollectionRef, event.id); 
    batch.set(docRef, event);
  });

  try {
    await batch.commit();
    console.log("✅ 成功！所有模擬活動資料都已上傳。");
    alert("活動資料庫填充成功！");
  } catch (error) {
    console.error("❗️ 填充活動資料時發生錯誤:", error);
  }
};

export const seedChallengesToFirestore = async () => {
  const challengesCollectionRef = collection(db, 'challenges');
  console.log("準備開始填充挑戰資料到 Firestore...");
  const batch = writeBatch(db);
  const { mockChallenges } = await import('./data/mockData.js');

  mockChallenges.forEach((challenge) => {
    const docRef = doc(challengesCollectionRef, challenge.id);
    batch.set(docRef, challenge);
  });

  try {
    await batch.commit();
    console.log("✅ 成功！所有模擬挑戰資料都已上傳。");
    alert("挑戰資料庫填充成功！");
  } catch (error) {
    console.error("❗️ 填充挑戰資料時發生錯誤:", error);
  }
};

export const seedChatsToFirestore = async () => {
  console.log("準備開始填充聊天資料...");
  const batch = writeBatch(db);
  
  for (const chatId in mockChats) {
    const chatMessages = mockChats[chatId];
    for (const message of chatMessages) {
      const messageRef = doc(collection(db, "chats", chatId, "messages"));
      const messageWithTimestamp = {
        ...message,
        timestamp: message.timestamp || new Date() 
      };
      batch.set(messageRef, messageWithTimestamp);
    }
  }

  try {
    await batch.commit();
    console.log("✅ 成功！所有模擬聊天資料都已上傳。");
  } catch (error) {
    console.error("❗️ 填充聊天資料時發生錯誤:", error);
  }
};

