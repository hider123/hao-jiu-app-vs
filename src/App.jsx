import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './Layout';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import ChallengesPage from './pages/ChallengesPage';
import ChallengeDetailPage from './pages/ChallengeDetailPage';
import FriendsPage from './pages/FriendsPage';
import EditProfilePage from './pages/EditProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import CreateChallengePage from './pages/CreateChallengePage'; // <--- 修正：補上這一行

// 路由守衛元件：檢查使用者是否登入
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    // 如果未登入，則導向到登入頁面
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* 主要頁面佈局 (有底部導覽列) */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>} >
          <Route index element={<HomePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="challenges" element={<ChallengesPage />} />
          <Route path="friends" element={<FriendsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        {/* 獨立的、受保護的頁面 (無底部導覽列) */}
        <Route path="/event/:eventId" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
        <Route path="/challenge/:challengeId" element={<ProtectedRoute><ChallengeDetailPage /></ProtectedRoute>} />
        <Route path="/create-event" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
        <Route path="/create-challenge" element={<ProtectedRoute><CreateChallengePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

        {/* 無需登入的頁面 */}
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/" /> : <AuthPage />} 
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

