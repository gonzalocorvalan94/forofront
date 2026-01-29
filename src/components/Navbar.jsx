import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Instituto Foro</Link>
      </div>
      
      <div className="nav-links">
        {user ? (
          /* Contenedor clave para que el saludo y el botón no se desarmen */
          <div className="user-info-block">
            <span className="user-name">
              Hola, <strong>{user?.Username || user?.username}</strong>
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Salir
            </button>
          </div>
        ) : (
          /* Lógica para mostrar Login o Registro según la página actual */
          <div className="nav-auth-links">
            {location.pathname === '/login' ? (
              <Link to="/register" className="btn-auth-nav">Registrarme</Link>
            ) : (
              <Link to="/login" className="btn-auth-nav">Iniciar Sesión</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;