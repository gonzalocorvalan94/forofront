import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data.categories);
      } catch (error) {
        console.error('Error al traer las categorías:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <div className="loading-screen">Cargando categorías...</div>;

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Temas del Foro</h1>
      </header>

      <div className="threads-list">
        {categories.map((category) => (
          <Link
            to={`/category/${category.ID}`}
            key={category.ID}
            className="home-thread-card"
            style={{ textDecoration: 'none' }}
          >
            <article>
              <h3 className="home-thread-title">{category.Name}</h3>
              <p className="home-thread-excerpt">{category.Description}</p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;