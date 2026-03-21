import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Error al conectar con el servidor';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <form onSubmit={handleSubmit}>
          <h2>Iniciar Sesión</h2>

          {error && <p className="error-message">{error}</p>}

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Iniciando sesión...
              </span>
            ) : (
              'Entrar'
            )}
          </button>

          <p className="forgot-password-link">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </p>

          <p className="login-footer">
            Usa tus credenciales de alumno para acceder al foro.
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
