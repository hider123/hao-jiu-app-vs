import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import Layout from './Layout';
import AdminLayout from './components/AdminLayout';

// Main Pages
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ChallengesPage from './pages/ChallengesPage';
import FriendsPage from './pages/FriendsPage';
import ProfilePage from './pages/ProfilePage';
import EventDetailPage from './pages/EventDetailPage';
import ChallengeDetailPage from './pages/ChallengeDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import EventPreviewPage from './pages/EventPreviewPage';
import CreateChallengePage from './pages/CreateChallengePage';
import EditProfilePage from './pages/EditProfilePage';
import EditEventPage from './pages/EditEventPage';
import ChatPage from './pages/ChatPage';

// Admin Pages
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminChallengesPage from './pages/admin/AdminChallengesPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';

// Public Pages
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';


// --- 路由守衛 (這是 App 的安全核心) ---

// 普通使用者路由守衛
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) { return <div className="flex justify-center items-center h-screen"><p>正在驗證身分...</p></div>; }
  if (!currentUser) { return <Navigate to="/login" replace />; }
  return children;
}

// 管理員專用路由守衛
function AdminRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) { 
    return (
      <div className="flex justify-center items-center h-screen">
        <p>正在驗證管理員權限...</p>
      </div>
    ); 
  }
  
  if (!currentUser || (userProfile?.role !== 'admin' && userProfile?.profile?.role !== 'admin')) { 
    return <Navigate to="/admin/login" replace />; 
  }
  return children;
}


function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* --- 1. 管理後台路由 (高優先級) --- */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="users" replace />} /> 
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="challenges" element={<AdminChallengesPage />} />
        </Route>

        {/* --- 2. 主要 App 路由 (給一般使用者) --- */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>} >
          <Route index element={<HomePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="challenges" element={<ChallengesPage />} />
          <Route path="friends" element={<FriendsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        {/* --- 3. 獨立的、受保護的頁面 --- */}
        <Route path="/event/:eventId" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
        <Route path="/event/:eventId/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/event/:eventId/edit" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
        <Route path="/challenge/:challengeId" element={<ProtectedRoute><ChallengeDetailPage /></ProtectedRoute>} />
        <Route path="/create-event" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
        <Route path="/create-event/preview" element={<ProtectedRoute><EventPreviewPage /></ProtectedRoute>} />
        <Route path="/create-challenge" element={<ProtectedRoute><CreateChallengePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

        {/* --- 4. 公開和 fallback 路由 (最低優先級) --- */}
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

