import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import './ThreadDetail.css';

// 1. DEFINIMOS LA URL DE TU BACKEND EN RENDER
const API_BASE_URL = 'https://foro-yes1.onrender.com';

// --- COMPONENTE HIJO ---
const ReplyForm = ({ 
  title, isClosing, content, setContent, onSubmit, submitting, 
  handleImage, fileRef, preview, setPreview, setImage 
}) => (
  <form className="reply-form" onSubmit={onSubmit}>
    <div className="form-header">
      <h4>{title}</h4>
      <button type="button" className="close-btn" onClick={isClosing}>✕</button>
    </div>
    <textarea
      placeholder="Escribe tu respuesta..."
      value={content}
      onChange={(e) => setContent(e.target.value)}
      autoFocus
      required
    />
    {preview && (
      <div className="image-preview-container">
        <img src={preview} alt="Preview" className="image-preview" />
        <button 
          type="button" 
          className="remove-preview" 
          onClick={() => { 
            setImage(null); 
            setPreview(null); 
            if(fileRef.current) fileRef.current.value = ""; 
          }}
        >✕</button>
      </div>
    )}
    <div className="form-actions">
      <div className="custom-file-upload">
        <label htmlFor="file-upload" className="file-label">Adjuntar imagen</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImage} 
          ref={fileRef} 
          id="file-upload" 
        />
      </div>
      <button type="submit" className="submit-btn" disabled={submitting}>
        {submitting ? 'Enviando...' : 'Publicar'}
      </button>
    </div>
  </form>
);

// --- COMPONENTE PRINCIPAL ---
const ThreadDetail = () => {
  const { threadId } = useParams();
  const fileInputRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMainForm, setShowMainForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [image, setImage] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null); 
  const [replyingTo, setReplyingTo] = useState(null); 
  const [submitting, setSubmitting] = useState(false);

  const fetchThread = useCallback(async () => {
    try {
      const response = await api.get(`/threads/${threadId}`);
      setData(response.data.data);
    } catch (error) {
      console.error('Error al cargar el hilo:', error);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const resetForm = () => {
    setReplyContent('');
    setImage(null);
    setPreviewUrl(null);
    setReplyingTo(null);
    setShowMainForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.append('content', replyContent);
    if (image) formData.append('image', image); 
    if (replyingTo) formData.append('parentReplyId', replyingTo.id);

    try {
      await api.post(`/threads/${threadId}/replies`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      resetForm();
      fetchThread();
    } catch (error) {
      console.error('Error al responder:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen">Cargando...</div>;
  if (!data) return <div className="error">Hilo no encontrado.</div>;

  return (
    <div className="thread-detail-container">
      <article className="main-thread">
        <h1>{data.thread.Title}</h1>
        <div className="thread-meta">
           <span>Por: <strong>{data.thread.authorName}</strong></span>
        </div>
        <p className="thread-content">{data.thread.Content}</p>
      </article>

      <div className="replies-section">
        <h3>Respuestas ({data.replies.length})</h3>
        {data.replies.map((reply) => {
          // 2. NORMALIZAMOS EL PATH DE LA IMAGEN
          const imgPath = reply.Image_url || reply.image_url;
          const isThisReplying = replyingTo?.id === reply.ID;

          return (
            <div key={reply.ID} className="reply-group">
              <div className={`reply-card ${reply.parent_reply_id ? 'nested' : ''}`}>
                <div className="reply-body">
                  <p className="reply-text">{reply.Content}</p>
                  
                  {/* 3. CONSTRUCCIÓN CORRECTA DE LA URL */}
                  {imgPath && (
                    <div className="reply-image-wrapper">
                      <img 
                        src={`${API_BASE_URL}${imgPath}`} 
                        alt="Adjunto" 
                        className="reply-attachment" 
                        onError={(e) => e.target.style.display = 'none'} // Si falla, que no se vea el icono roto
                      />
                    </div>
                  )}
                </div>
                <div className="reply-footer">
                  <small>Por: <strong>{reply.authorName}</strong></small>
                  <button
                    className="reply-btn-small"
                    onClick={() => {
                      setReplyingTo({ id: reply.ID, user: reply.authorName });
                      setShowMainForm(false);
                      setReplyContent('');
                    }}
                  >
                    Responder
                  </button>
                </div>
              </div>
              
              {isThisReplying && (
                <div className="nested-form-container">
                  <ReplyForm 
                    title={`Respondiendo a ${replyingTo.user}`} 
                    isClosing={() => setReplyingTo(null)}
                    content={replyContent}
                    setContent={setReplyContent}
                    onSubmit={handleReplySubmit}
                    submitting={submitting}
                    handleImage={handleImageChange}
                    fileRef={fileInputRef}
                    preview={previewUrl}
                    setPreview={setPreviewUrl}
                    setImage={setImage}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="main-reply-wrapper">
        {!showMainForm && !replyingTo ? (
          <button className="open-form-btn" onClick={() => setShowMainForm(true)}>
            + Responder al Hilo
          </button>
        ) : (
          !replyingTo && (
            <ReplyForm 
              title="Nueva respuesta al hilo" 
              isClosing={() => setShowMainForm(false)}
              content={replyContent}
              setContent={setReplyContent}
              onSubmit={handleReplySubmit}
              submitting={submitting}
              handleImage={handleImageChange}
              fileRef={fileInputRef}
              preview={previewUrl}
              setPreview={setPreviewUrl}
              setImage={setImage}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ThreadDetail;