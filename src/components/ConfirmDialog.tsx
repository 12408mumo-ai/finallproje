import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  loading?: boolean;
  loadingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  loading = false,
  loadingLabel = 'Working...',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={loading ? () => undefined : onCancel} className="confirm-modal">
      <div className="confirm-content">
        <span className="confirm-icon" aria-hidden="true">
          <AlertTriangle size={22} />
        </span>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="button button-secondary" type="button" disabled={loading} onClick={onCancel}>
            Cancel
          </button>
          <button className="button button-danger" type="button" disabled={loading} onClick={onConfirm}>
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
