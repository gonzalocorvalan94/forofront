import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import './Home.css';

const Home = () => {
  const { categoryId } = useParams(); // ← toma el ID de la URL
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await api.get(`/threads/category/${categoryId}`);
        setThreads(response.data.data.threads);
      } catch (error) {
        console.error('Error al traer los hilos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, [categoryId]);

  if (loading) return <div className="loading-screen">Cargando hilos...</div>;

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Hilos</h1>
        <Link to="/create-thread" className="btn-neon">
          + Nuevo Hilo
        </Link>
      </header>

      <div className="threads-list">
        {threads.length > 0 ? (
          threads.map((thread) => (
            <article key={thread.ID} className="home-thread-card">
              <Link to={`/thread/${thread.ID}`} className="home-thread-link">
                <h3 className="home-thread-title">{thread.Title}</h3>
              </Link>
              <p className="home-thread-excerpt">
                {thread.Content.substring(0, 150)}...
              </p>
              <footer className="home-thread-footer">
                <span className="home-author-badge">{thread.authorName}</span>
                <span className="home-date-badge">
                  {new Date(thread.Created_at).toLocaleDateString()}
                </span>
              </footer>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <p>No hay hilos en esta categoría todavía.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
