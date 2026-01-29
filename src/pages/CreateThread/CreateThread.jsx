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
      title: title, 
      content: content, 
      categoryId: 1 // <--- Agregamos esto para cumplir con el NOT NULL de la DB
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