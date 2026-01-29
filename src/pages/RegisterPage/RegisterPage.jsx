import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import './RegisterPage.css'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // ✅ URL limpia y coherente con el backend
    const response = await api.post('/auth/register', {
      username: formData.username,
      email: formData.email,
      password: formData.password
    });

    console.log('Registro exitoso:', response.data);
    navigate('/login'); // Lo mandamos a loguearse
  } catch (err) {
    setError(err.response?.data?.message || 'Error en el registro');
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
          required 
        />

        <input 
          name="email"
          type="email" 
          placeholder="Correo electrónico" 
          onChange={handleChange}
          required 
        />

        <input 
          name="password"
          type="password" 
          placeholder="Contraseña" 
          onChange={handleChange}
          required 
        />

        <input 
          name="confirmPassword"
          type="password" 
          placeholder="Confirmar contraseña" 
          onChange={handleChange}
          required 
        />

        <button type="submit" className="btn-register">Registrarse</button>
        
        <p className="register-footer">
          ¿Ya tienes cuenta? <Link to="/login" className="register-link">Inicia sesión</Link>
        </p>
      </form>
    </div>
  </div>
);
};

export default RegisterPage;