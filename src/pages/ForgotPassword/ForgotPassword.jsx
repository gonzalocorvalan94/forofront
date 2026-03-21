import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: respuesta + nueva contraseña
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/question', { email });
      setQuestion(res.data.data.question);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al buscar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (securityAnswer.trim().includes(' ')) {
      return setError('La respuesta debe ser una sola palabra');
    }

    if (newPassword.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }

    if (newPassword !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password/reset', {
        email,
        securityAnswer: securityAnswer.trim().toLowerCase(),
        newPassword,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al resetear la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <h2>Recuperar Contraseña</h2>
            {error && <p className="error-message">{error}</p>}
            <p className="forgot-hint">Ingresá tu email para continuar</p>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <button type="submit" className="btn-forgot" disabled={loading}>
              {loading ? 'Buscando...' : 'Continuar'}
            </button>
            <p className="forgot-footer">
              <Link to="/login" className="forgot-link">← Volver al login</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <h2>Recuperar Contraseña</h2>
            {error && <p className="error-message">{error}</p>}

            <div className="security-question-section">
              <p className="security-question-label">Pregunta de seguridad:</p>
              <p className="security-question-text">{question}</p>
              <input
                placeholder="Tu respuesta (una sola palabra)"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                disabled={loading}
                required
              />
              <small className="security-hint">No distingue mayúsculas.</small>
            </div>

            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              required
            />

            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />

            <button type="submit" className="btn-forgot" disabled={loading}>
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;