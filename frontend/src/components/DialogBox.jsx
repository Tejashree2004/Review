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

  // Existing props support
  onConfirm,
  onCancel,

  // IMPORTANT:
  // Signup.jsx, WriteReview.jsx etc. already use onClose
  onClose,
}) {
  if (!isOpen) {
    return null;
  }

  // =====================================================
  // ICON
  // =====================================================

  const getIcon = () => {
    if (type === "success") {
      return <FaCheckCircle />;
    }

    if (type === "error") {
      return <FaExclamationTriangle />;
    }

    return <FaInfoCircle />;
  };

  // =====================================================
  // CLOSE / NEXT PROCESS
  // =====================================================

  const handleClose = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    /*
      Priority:

      1. onClose
      2. onConfirm

      Aapke Signup.jsx aur WriteReview.jsx mein
      onClose={closeDialog} use ho raha hai.

      Isliye onClose call hone par parent ka
      closeDialog() chalega aur uske andar
      dialog.action() execute hoga.
    */

    if (typeof onClose === "function") {
      onClose();
      return;
    }

    if (typeof onConfirm === "function") {
      onConfirm();
    }
  };

  // =====================================================
  // SCREEN / DIALOG TOUCH
  // =====================================================

  const handleScreenTouch = (event) => {
    /*
      Agar Cancel button par touch hua hai,
      toh confirm / next process nahi chalega.
    */

    if (
      event.target.closest(".dialog-cancel-btn")
    ) {
      return;
    }

    handleClose(event);
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (typeof onCancel === "function") {
      onCancel();
      return;
    }

    /*
      Agar onCancel nahi diya gaya hai,
      toh onClose ko fallback ke roop mein use karenge.
    */

    if (typeof onClose === "function") {
      onClose();
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="dialog-overlay"
      onPointerDown={handleScreenTouch}
    >
      <div
        className={`dialog-box dialog-${type}`}
        role="dialog"
        aria-modal="true"
        onPointerDown={handleScreenTouch}
      >
        {/* =================================================
            ICON
        ================================================= */}

        <div className="dialog-icon">
          {getIcon()}
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="dialog-content">
          <h2>{title}</h2>

          <p>{message}</p>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="dialog-actions">
          {showCancel && (
            <button
              type="button"
              className="dialog-btn dialog-cancel-btn"
              onPointerDown={handleCancel}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            className="dialog-btn dialog-confirm-btn"
            onPointerDown={handleClose}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DialogBox;