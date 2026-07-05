import React from 'react';
import Modal from './common/Modal';

export default function ConfirmModal({ isOpen, title, message, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      type={danger ? 'error' : 'info'}
      footer={
        <>
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`modal-btn modal-btn-confirm btn-${danger ? 'danger' : 'info'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>{message}</p>
    </Modal>
  );
}
