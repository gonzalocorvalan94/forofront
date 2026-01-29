import { createContext, useState, useContext } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    // 1. Llamamos a tu controlador de Login
    const res = await api.post('/auth/login', { email, password });
    
    // 2. Guardamos el TOKEN que generaste en el backend
    localStorage.setItem('token', res.data.token);
    
    // 3. Guardamos los datos del usuario en el estado
    setUser(res.data.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);