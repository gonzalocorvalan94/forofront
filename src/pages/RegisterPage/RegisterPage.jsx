import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios.js';
import './RegisterPage.css';

const SECURITY_QUESTIONS = [
  '¿Cuál es el nombre de tu mascota?',
  '¿En qué ciudad naciste?',
  '¿Cuál es el nombre de tu mejor amigo/a de la infancia?',
  '¿Cuál es tu comida favorita?',
  '¿Cuál es el apodo que te puso tu familia?',
  '¿Cuál es tu película favorita?',
  '¿Cuál es el nombre de tu canción favorita?',
  '¿Cuál es tu deporte favorito?',
  '¿Cuál es tu color favorito?',
  '¿Cuál es el nombre de tu actor o actriz favorito/a?',
];

// Elige una pregunta aleatoria al cargar el componente
const getRandomQuestion = () =>
  SECURITY_QUESTIONS[Math.floor(Math.random() * SECURITY_QUESTIONS.length)];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityAnswer: '',
  });
  const [securityQuestion] = useState(getRandomQuestion);
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

    if (formData.username.length < 4) {
      return setError('El nombre de usuario debe tener al menos 4 caracteres');
    }

    if (formData.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    if (formData.securityAnswer.trim().includes(' ')) {
      return setError('La respuesta debe ser una sola palabra');
    }

    if (!formData.securityAnswer.trim()) {
      return setError('Por favor respondé la pregunta de seguridad');
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        securityQuestion,
        securityAnswer: formData.securityAnswer.trim().toLowerCase(),
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

          <div className="security-question-section">
            <p className="security-question-label">Pregunta de seguridad:</p>
            <p className="security-question-text">{securityQuestion}</p>
            <input
              name="securityAnswer"
              placeholder="Tu respuesta (una sola palabra)"
              onChange={handleChange}
              disabled={loading}
              required
            />
            <small className="security-hint">
              Usá una sola palabra. No distingue mayúsculas.
            </small>
          </div>

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