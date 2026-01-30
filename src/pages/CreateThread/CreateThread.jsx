import { useState } from 'react';
import api from '../../api/axios.js';
import { useNavigate } from 'react-router-dom';
import './CreateThread.css'; // Importamos su CSS propio

const CreateThread = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Mandamos todo en minúsculas para que el controlador lo reciba bien
    await api.post('/threads', { 
  Title: title,          // Con T mayúscula si tu DB es estricta
  Content: content,      // Con C mayúscula
  category_id: 2,        // El ID real que te dio el SELECT (ID 2)
  user_id: 5             // ¡OJO! Acá tenés que poner un ID de un usuario que exista en TiDB
});
    navigate('/'); 
  } catch (error) {
    console.error('Error al crear hilo:', error.response?.data);
    alert('No se pudo crear el hilo.');
  }
};

  return (
  <div className="create-thread-container">
    <div className="create-thread-card">
      <form onSubmit={handleSubmit}>
        <h2>Nuevo Hilo</h2>
        
        <input 
          type="text" 
          placeholder="Título descriptivo..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required 
        />

        <textarea 
          placeholder="Escribí acá el contenido de tu hilo..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <button type="submit" className="btn-publish">
          Publicar en el Foro
        </button>
      </form>
    </div>
  </div>
);
};

export default CreateThread;