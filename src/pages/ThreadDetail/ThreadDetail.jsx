import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './ThreadDetail.css';

const API_BASE_URL = 'https://foro-yes1.onrender.com';

// --- MODAL DE CONFIRMACIÓN ---
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <p>{message}</p>
      <div className="modal-actions">
        <button className="btn-confirm-delete" onClick={onConfirm}>Sí, eliminar</button>
        <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  </div>
);

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

// --- FUNCIÓN PARA CONSTRUIR ÁRBOL DE REPLIES ---
const buildReplyTree = (replies) => {
  const map = {};
  const roots = [];

  // Primero indexamos todos los replies por ID
  replies.forEach(reply => {
    map[reply.ID] = { ...reply, children: [] };
  });

  // Luego los organizamos en árbol
  replies.forEach(reply => {
    if (reply.parent_reply_id && map[reply.parent_reply_id]) {
      map[reply.parent_reply_id].children.push(map[reply.ID]);
    } else {
      roots.push(map[reply.ID]);
    }
  });

  return roots;
};

// --- COMPONENTE REPLY RECURSIVO ---
const ReplyItem = ({ 
  reply, depth, replyingTo, setReplyingTo, setShowMainForm, setReplyContent,
  handleDeleteReply, canDeleteReply, removingId, replyContent, setContent,
  handleReplySubmit, submitting, handleImageChange, fileInputRef, previewUrl,
  setPreviewUrl, setImage
}) => {
  const imgPath = reply.Image_url || reply.image_url;
  const isThisReplying = replyingTo?.id === reply.ID;

  return (
    <div className={`reply-group ${removingId === reply.ID ? 'removing' : ''}`}>
      <div className={`reply-card ${depth > 0 ? 'nested' : ''}`}>
        <div className="reply-body">
          <p className="reply-text">{reply.Content}</p>
          {imgPath && (
            <div className="reply-image-wrapper">
              <img 
                src={`${API_BASE_URL}${imgPath}`} 
                alt="Adjunto" 
                className="reply-attachment" 
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
        </div>
        <div className="reply-footer">
          <small>Por: <strong>{reply.authorName}</strong></small>
          <div className="reply-actions">
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
            {canDeleteReply(reply) && (
              <button
                className="btn-delete-small"
                onClick={() => handleDeleteReply(reply.ID)}
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Formulario justo debajo del reply al que respondemos */}
      {isThisReplying && (
        <div className="nested-form-container">
          <ReplyForm 
            title={`Respondiendo a ${replyingTo.user}`} 
            isClosing={() => setReplyingTo(null)}
            content={replyContent}
            setContent={setContent}
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

      {/* Replies hijos recursivamente */}
      {reply.children?.length > 0 && (
        <div className="children-container">
          {reply.children.map(child => (
            <ReplyItem
              key={child.ID}
              reply={child}
              depth={depth + 1}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              setShowMainForm={setShowMainForm}
              setReplyContent={setReplyContent}
              handleDeleteReply={handleDeleteReply}
              canDeleteReply={canDeleteReply}
              removingId={removingId}
              replyContent={replyContent}
              setContent={setContent}
              handleReplySubmit={handleReplySubmit}
              submitting={submitting}
              handleImageChange={handleImageChange}
              fileInputRef={fileInputRef}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              setImage={setImage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const ThreadDetail = () => {
  const { threadId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMainForm, setShowMainForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [image, setImage] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null); 
  const [replyingTo, setReplyingTo] = useState(null); 
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [confirm, setConfirm] = useState(null); 

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

  const handleDeleteThread = () => {
    setConfirm({
      message: '¿Estás seguro que deseas eliminar este hilo? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await api.delete(`/threads/${threadId}`);
          navigate('/');
        } catch (error) {
          console.error('Error al eliminar el hilo:', error);
        } finally {
          setConfirm(null);
        }
      }
    });
  };

  const handleDeleteReply = (replyId) => {
    setConfirm({
      message: '¿Estás seguro que deseas eliminar este comentario?',
      onConfirm: async () => {
        setConfirm(null);
        setRemovingId(replyId);
        await new Promise(resolve => setTimeout(resolve, 400));
        try {
          await api.delete(`/threads/replies/${replyId}`);
          fetchThread();
        } catch (error) {
          console.error('Error al eliminar el comentario:', error);
          setRemovingId(null);
        }
      }
    });
  };

  const canDeleteThread = () => {
    if (!user || !data) return false;
    return user.id === data.thread.user_id || user.role === 'admin';
  };

  const canDeleteReply = (reply) => {
    if (!user) return false;
    return user.id === reply.user_id || user.role === 'admin';
  };

  if (loading) return <div className="loading-screen">Cargando...</div>;
  if (!data) return <div className="error">Hilo no encontrado.</div>;

  const replyTree = buildReplyTree(data.replies);

  return (
    <div className="thread-detail-container">

      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <article className="main-thread">
        <h1>{data.thread.Title}</h1>
        <div className="thread-meta">
          <span>Por: <strong>{data.thread.authorName}</strong></span>
          {canDeleteThread() && (
            <button className="btn-delete" onClick={handleDeleteThread}>
              Eliminar hilo
            </button>
          )}
        </div>
        <p className="thread-content">{data.thread.Content}</p>
      </article>

      <div className="replies-section">
        <h3>Respuestas ({data.replies.length})</h3>
        {replyTree.map(reply => (
          <ReplyItem
            key={reply.ID}
            reply={reply}
            depth={0}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            setShowMainForm={setShowMainForm}
            setReplyContent={setReplyContent}
            handleDeleteReply={handleDeleteReply}
            canDeleteReply={canDeleteReply}
            removingId={removingId}
            replyContent={replyContent}
            setContent={setReplyContent}
            handleReplySubmit={handleReplySubmit}
            submitting={submitting}
            handleImageChange={handleImageChange}
            fileInputRef={fileInputRef}
            previewUrl={previewUrl}
            setPreviewUrl={setPreviewUrl}
            setImage={setImage}
          />
        ))}
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