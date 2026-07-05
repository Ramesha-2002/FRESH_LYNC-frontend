import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICON_MAP = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function Toast({ id, message, type = 'info', duration = 4000, onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);

  const startTimer = () => {
    if (duration === Infinity) return;
    timerRef.current = setTimeout(() => {
      handleClose();
    }, duration);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    // Wait for the exit animation to finish
    setTimeout(() => {
      onClose(id);
    }, 250);
  };

  useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, []);

  const IconComponent = ICON_MAP[type] || Info;

  return (
    <div
      className={`toast-item toast-${type} ${isExiting ? 'toast-exit' : ''}`}
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
      role="alert"
      aria-live="assertive"
    >
      <div className="toast-icon">
        <IconComponent size={20} />
      </div>
      <div className="toast-content">
        <div className="toast-title">{type}</div>
        <div className="toast-message">{message}</div>
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
}
