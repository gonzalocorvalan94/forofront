import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios.js';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Todas las validaciones ANTES de setLoading
    if (formData.username.length < 4) {
      return setError('El nombre de usuario debe tener al menos 4 caracteres');
    }

    if (formData.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    setLoading(true); // ← recién acá
    try {
      await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        <form onSubmit={handleSubmit}>
          <h2>Crear Cuenta</h2>

          {error && <p className="error-message">{error}</p>}

          <input
            name="username"
            placeholder="Nombre de usuario"
            onChange={handleChange}
            disabled={loading}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            onChange={handleChange}
            disabled={loading}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            onChange={handleChange}
            disabled={loading}
            required
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            onChange={handleChange}
            disabled={loading}
            required
          />

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Creando cuenta...
              </span>
            ) : (
              'Registrarse'
            )}
          </button>

          <p className="register-footer">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="register-link">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
