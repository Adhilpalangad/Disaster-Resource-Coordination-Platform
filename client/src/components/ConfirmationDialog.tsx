import React from "react";
import Modal from "./Modal.js";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) => {
  let confirmBg = "#EF4444";
  if (variant === "warning") confirmBg = "#F59E0B";
  if (variant === "info") confirmBg = "#0284C7";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border, #E2E8F0)",
              backgroundColor: "#FFFFFF",
              color: "var(--secondary, #475569)",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: confirmBg,
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <div
          style={{
            padding: "10px",
            borderRadius: "50%",
            backgroundColor: `${confirmBg}15`,
            color: confirmBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <p style={{ margin: 0, fontSize: "14px", color: "var(--secondary, #475569)", lineHeight: 1.5 }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
