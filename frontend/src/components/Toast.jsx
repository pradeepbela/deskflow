import { useState, useEffect } from 'react';

let toastId = 0;

let globalSetToasts = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  globalSetToasts = setToasts;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type} ${t.removing ? 'removing' : ''}`}>
          <span>{t.type === 'success' ? '✓' : '✕'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function showToast(message, type = 'success', duration = 3500) {
  if (!globalSetToasts) return;
  const id = ++toastId;
  globalSetToasts((prev) => [...prev, { id, message, type }]);
  setTimeout(() => {
    globalSetToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
    );
    setTimeout(() => {
      globalSetToasts((prev) => prev.filter((t) => t.id !== id));
    }, 280);
  }, duration);
}
