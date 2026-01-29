import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiamos errores previos

    try {
      // 1. Llamamos a la función login del Contexto
      await login(email, password);
      
      // 2. Si sale bien, mandamos al usuario al Home
      navigate('/');
    } catch (err) {
      // 3. Si tu backend falla, capturamos el mensaje que vos configuraste
      const message = err.response?.data?.message || 'Error al conectar con el servidor';
      setError(message);
    }
  };

  return (
  <div className="login-page-container">
    <div className="login-card"> {/* Cambié form por un div envoltorio y el form adentro */}
      <form onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        
        {error && <p className="error-message">{error}</p>}

        <input 
          type="email" 
          placeholder="Correo electrónico" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />

        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />

        <button type="submit" className="btn-login">Entrar</button>
        
        <p className="login-footer">
          Usa tus credenciales de alumno para acceder al foro.
        </p>
      </form>
    </div>
  </div>
);
};

export default LoginPage;