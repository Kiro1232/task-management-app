import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const typeClasses: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
};

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      // Wait for CSS fade-out before removing from DOM
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const dismiss = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={[
        'fixed bottom-6 left-1/2 z-50 flex w-[min(92vw,28rem)] -translate-x-1/2 items-center gap-3',
        'rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur',
        'transition-all duration-300',
        typeClasses[type],
        visible ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2',
      ].join(' ')}
      role="alert"
      aria-live="polite"
    >
      <span className="text-lg font-bold">{typeIcons[type]}</span>
      <p className="flex-1 text-sm font-medium leading-6">{message}</p>
      <button
        onClick={dismiss}
        className="ml-2 transition-opacity opacity-60 hover:opacity-100"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}
