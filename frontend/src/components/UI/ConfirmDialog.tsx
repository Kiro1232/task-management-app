import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangleIcon } from './Icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isProcessing?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-200">
            <AlertTriangleIcon className="h-5 w-5" />
          </div>
          <p className="pt-1 text-sm leading-6 text-slate-600">{message}</p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={() => void onConfirm()}
            isLoading={isProcessing}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
