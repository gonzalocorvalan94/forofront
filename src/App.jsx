import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './index.css'; // Primero los estilos base
import './App.css';   // Luego los estilos de layout

// Importamos tus páginas
import Home from './pages/Home/Home';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ThreadDetail from './pages/ThreadDetail/ThreadDetail';
import CreateThread from './pages/CreateThread/CreateThread'; // <-- AGREGADO
import Notifications from './pages/Notifications/Notifications'; 
import Navbar from './components/Navbar';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="app-container">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas Privadas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/thread/:threadId" // Cambié :id a :threadId para que coincida con tu componente
            element={
              <ProtectedRoute>
                <ThreadDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-thread" // <-- RUTA PARA CREAR HILOS
            element={
              <ProtectedRoute>
                <CreateThread />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;