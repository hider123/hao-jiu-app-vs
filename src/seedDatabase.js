import { db } from './firebaseConfig';
import { collection, doc, writeBatch } from 'firebase/firestore';
// 從 mockData 中同時引入 events 和 challenges
import mockEvents, { mockChallenges } from './data/mockData.js';

/**
 * 將本地的 mockEvents 資料上傳到 Firestore 的 'events' 集合。
 */
export const seedEventsToFirestore = async () => {
  const eventsCollectionRef = collection(db, 'events');
  console.log("準備開始填充活動資料到 Firestore...");
  const batch = writeBatch(db);

  mockEvents.forEach((event) => {
    const docRef = doc(eventsCollectionRef, event.id); 
    batch.set(docRef, event);
  });

  try {
    await batch.commit();
    console.log("✅ 成功！所有模擬活動資料都已上傳到 Firestore。");
    alert("活動資料庫填充成功！");
  } catch (error) {
    console.error("❗️ 填充活動資料時發生錯誤:", error);
    alert("活動資料庫填充失敗，請查看主控台錯誤訊息。");
  }
};

/**
 * 將本地的 mockChallenges 資料上傳到 Firestore 的 'challenges' 集合。
 */
export const seedChallengesToFirestore = async () => {
  const challengesCollectionRef = collection(db, 'challenges');
  console.log("準備開始填充挑戰資料到 Firestore...");
  const batch = writeBatch(db);

  mockChallenges.forEach((challenge) => {
    const docRef = doc(challengesCollectionRef, challenge.id);
    batch.set(docRef, challenge);
  });

  try {
    await batch.commit();
    console.log("✅ 成功！所有模擬挑戰資料都已上傳到 Firestore。");
    alert("挑戰資料庫填充成功！");
  } catch (error) {
    console.error("❗️ 填充挑戰資料時發生錯誤:", error);
    alert("挑戰資料庫填充失敗，請查看主控台錯誤訊息。");
  }
};

