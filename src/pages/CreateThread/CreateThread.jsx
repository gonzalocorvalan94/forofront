import { useState } from 'react';
import api from '../../api/axios.js';
import { useNavigate } from 'react-router-dom';
import './CreateThread.css';

const CreateThread = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/threads', {
        title,
        content,
        categoryId: 2, // cambiá esto cuando tengas selección de categoría
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