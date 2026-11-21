
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

import "../styles/DialogBox.css";

function DialogBox({
  isOpen,
  title = "Message",
  message = "",
  type = "info",
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
  onConfirm,
  onCancel,
  onClose,
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    if (type === "success") return <FaCheckCircle />;
    if (type === "error") return <FaExclamationTriangle />;
    return <FaInfoCircle />;
  };

  const handleClose = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (typeof onClose === "function") {
      onClose();
    } else if (typeof onConfirm === "function") {
      onConfirm();
    }
  };

  const handleCancel = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (typeof onCancel === "function") {
      onCancel();
    } else if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div
      className="dialog-overlay"
      onClick={handleClose}
    >
      <div
        className={`dialog-box dialog-${type}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-icon">
          {getIcon()}
        </div>

        <div className="dialog-content">
          <h2>{title}</h2>
          <p>{message}</p>
        </div>

        <div className="dialog-actions">
          {showCancel && (
            <button
              type="button"
              className="dialog-btn dialog-cancel-btn"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            className="dialog-btn dialog-confirm-btn"
            onClick={handleClose}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DialogBox;
