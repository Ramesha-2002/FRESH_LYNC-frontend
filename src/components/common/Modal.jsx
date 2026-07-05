import React, { useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const ICON_MAP = {
  success: { icon: CheckCircle, color: '#10b981' },
  error: { icon: AlertCircle, color: '#ef4444' },
  warning: { icon: AlertTriangle, color: '#f59e0b' },
  info: { icon: Info, color: '#3b82f6' },
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  type = 'info', // success, error, warning, info
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement;
      // Focus the modal itself or first focusable element
      if (modalRef.current) {
        modalRef.current.focus();
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }

        if (e.key === 'Tab') {
          if (!modalRef.current) return;
          const focusableElements = modalRef.current.querySelectorAll(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      // Prevent scrolling body
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        // Restore focus
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const IconInfo = ICON_MAP[type] || ICON_MAP.info;
  const IconComponent = IconInfo.icon;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-container"
        ref={modalRef}
        tabIndex="-1"
      >
        <div className="modal-header">
          <div className="modal-title-area">
            <span className="modal-icon" style={{ color: IconInfo.color }}>
              <IconComponent size={24} />
            </span>
            <h2 id="modal-title" className="modal-title">{title}</h2>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
