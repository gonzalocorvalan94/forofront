import { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { useNavigate, useLocation } from 'react-router-dom';
import './CreateThread.css';

const CreateThread = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Cargamos las categorías disponibles
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data.categories);

        // Si venimos de una categoría específica, la preseleccionamos
        const params = new URLSearchParams(location.search);
        const catFromUrl = params.get('categoryId');
        if (catFromUrl) {
          setCategoryId(catFromUrl);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    fetchCategories();
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryId) {
      alert('Por favor seleccioná una categoría');
      return;
    }

    setLoading(true);
    try {
      await api.post('/threads', {
        title,
        content,
        categoryId: Number(categoryId),
      });
      navigate(`/category/${categoryId}`); // vuelve a la categoría donde publicó
    } catch (error) {
      console.error('Error al crear hilo:', error.response?.data);
      alert('No se pudo crear el hilo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-thread-container">
      <div className="create-thread-card">
        <form onSubmit={handleSubmit}>
          <h2>Nuevo Hilo</h2>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="category-select"
          >
            <option value="">Seleccioná una categoría...</option>
            {categories.map((cat) => (
              <option key={cat.ID} value={cat.ID}>
                {cat.Name}
              </option>
            ))}
          </select>

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

          <button type="submit" className="btn-publish" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar en el Foro'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateThread;