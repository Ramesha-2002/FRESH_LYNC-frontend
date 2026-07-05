import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';
import Modal from '../components/common/Modal';
import '../components/common/Notification.css';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showConfirm = useCallback(({
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'warning'
  }) => {
    setModal({
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      type
    });
  }, []);

  const handleModalConfirm = () => {
    if (modal && modal.onConfirm) {
      modal.onConfirm();
    }
    setModal(null);
  };

  const handleModalCancel = () => {
    if (modal && modal.onCancel) {
      modal.onCancel();
    }
    setModal(null);
  };

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Global Toast Notifications Stack */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={dismissToast}
          />
        ))}
      </div>

      {/* Global Confirmation Modal */}
      {modal && (
        <Modal
          isOpen={!!modal}
          title={modal.title}
          type={modal.type}
          onClose={handleModalCancel}
          footer={
            <>
              <button
                className="modal-btn modal-btn-cancel"
                onClick={handleModalCancel}
              >
                {modal.cancelText}
              </button>
              <button
                className={`modal-btn modal-btn-confirm btn-${modal.type}`}
                onClick={handleModalConfirm}
              >
                {modal.confirmText}
              </button>
            </>
          }
        >
          <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>{modal.message}</p>
        </Modal>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
