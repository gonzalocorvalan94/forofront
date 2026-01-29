import axios from 'axios';

const api = axios.create({
  baseURL: 'https://foro-yes1.onrender.com/api/v1',
});

// Interceptor de PETICIÓN (Request)
api.interceptors.request.use(
  (config) => {
    // Buscamos el token que guardaste en el login
    const token = localStorage.getItem('token');
    
    if (token) {
      // Configuramos el header siguiendo el estándar Bearer
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de RESPUESTA (Opcional pero recomendado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor nos dice 401 (Token expirado o inválido)
    if (error.response && error.response.status === 401) {
      console.warn("Token inválido o expirado. Limpiando sesión...");
      localStorage.removeItem('token');
      // Podrías redireccionar al login aquí si quisieras
    }
    return Promise.reject(error);
  }
);

export default api;