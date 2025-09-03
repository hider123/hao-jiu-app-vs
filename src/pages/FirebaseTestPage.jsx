import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // 確保這是您設定檔的正確路徑

export default function FirebaseTestPage() {
  const [testResult, setTestResult] = useState('正在測試連線...');
  const [userData, setUserData] = useState(null);

  // 您的管理員 UID，請從 Firebase Console 的 Authentication 頁面複製
  const ADMIN_UID = "EzD7YfmkjJR426flcq8H56gUdyO2"; // <-- 在這裡貼上

  useEffect(() => {
    const runTest = async () => {
      if (ADMIN_UID === "請在這裡貼上您的管理員UID") {
        setTestResult("錯誤：請在程式碼中填寫您的管理員 UID！");
        return;
      }

      try {
        // 嘗試讀取您的管理員使用者文件
        const userDocRef = doc(db, "users", ADMIN_UID);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          setTestResult("✅ 連線成功！成功從 Firestore 讀取到資料。");
          setUserData(docSnap.data());
        } else {
          setTestResult("❌ 連線成功，但找不到指定的使用者文件。請確認 UID 是否正確。");
        }
      } catch (error) {
        console.error("Firebase 連線測試失敗:", error);
        setTestResult(`❌ 連線失敗！請檢查瀏覽器主控台的錯誤訊息。錯誤：${error.message}`);
      }
    };

    runTest();
  }, [ADMIN_UID]);

  return (
    <div className="p-8 font-mono">
      <h1 className="text-2xl font-bold">Firebase 連線測試</h1>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="font-bold">測試結果：</p>
        <p className={testResult.startsWith('✅') ? 'text-green-600' : 'text-red-600'}>
          {testResult}
        </p>
      </div>
      
      {userData && (
        <div className="mt-4 p-4 bg-blue-100 rounded">
          <p className="font-bold">讀取到的使用者資料：</p>
          <pre className="mt-2 text-sm whitespace-pre-wrap">
            {JSON.stringify(userData, null, 2)}
          </pre>
          {userData.role === 'admin' ? (
            <p className="mt-2 font-bold text-green-700">🎉 偵測到 role: 'admin'！</p>
          ) : (
            <p className="mt-2 font-bold text-red-700">⚠️ 未偵測到 role: 'admin'！請檢查 Firebase 資料庫中的欄位。</p>
          )}
        </div>
      )}
    </div>
  );
}