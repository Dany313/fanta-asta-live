import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importiamo le Pagine
import AdminDashboard from './features/admin/AdminDashboard';
import AdminLogin from './features/admin/AdminLogin';
import ViewerBoard from './features/viewer/ViewerBoard';
import JoinViewer from './features/viewer/JoinViewer';

// Importiamo i Componenti globali
import Navbar from './components/Navbar';
import LeaguesPage from './features/leagues/LeaguesPage';
import TeamsPage from './features/teams/TeamsPage';

// Le nostre "Guardie" per proteggere le rotte
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedViewerRoute = ({ children }) => {
  const token = localStorage.getItem('viewerToken');
  if (!token) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
        <h2>Accesso Riservato ⛔</h2>
        <p>Devi utilizzare il link di invito fornito dall'Admin per vedere il tabellone.</p>
      </div>
    );
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      {/* 🌟 LA NOSTRA NUOVA NAVBAR */}
      <Navbar />

      {/* Un contenitore generico per staccare i contenuti dalla navbar */}
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          
          <Route path="/leagues" element={
            <ProtectedAdminRoute>
              <LeaguesPage />
            </ProtectedAdminRoute>
          } />

          <Route path="/leagues/:leagueId" element={
            <ProtectedAdminRoute>
              <TeamsPage />
            </ProtectedAdminRoute>
          } />
          
          <Route path="/join/:token" element={<JoinViewer />} />
          
          <Route path="/viewer" element={
            <ProtectedViewerRoute>
              <ViewerBoard />
            </ProtectedViewerRoute>
          } />
          
          <Route path="/" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>Benvenuto all'Asta del Fantacalcio! ⚽</h1>
              <p>Scegli un'area dal menu in alto per iniziare.</p>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;