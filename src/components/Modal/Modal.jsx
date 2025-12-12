import { useState, useEffect } from "react";
import "./styles.css";

function Modal({ isOpen, onClose, onConfirm, title, children }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 500); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isClosing, onClose]);

  if (!isOpen && !isClosing) {
    return null;
  }

  const handleClose = () => {
    setIsClosing(true);
  };

  return (
    <div
      className={`modal-overlay ${isClosing ? "closing" : ""}`}
      onClick={handleClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button onClick={handleClose} className="secondary-button">
            Cancel
          </button>
          <button onClick={onConfirm} className="primary-button">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
