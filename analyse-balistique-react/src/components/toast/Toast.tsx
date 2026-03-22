import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, X, Download } from 'lucide-react';
import { playSuccess, playWarning, playExport } from '../../lib/sounds';
import './Toast.css';

type ToastType = 'success' | 'warning' | 'info' | 'export';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
  export: <Download size={16} />,
};

let toastId = 0;
const listeners: Set<(toast: ToastData) => void> = new Set();

const SOUNDS: Record<ToastType, (() => void) | null> = {
  success: playSuccess,
  warning: playWarning,
  info: null,
  export: playExport,
};

export function toast(message: string, type: ToastType = 'success') {
  const t: ToastData = { id: ++toastId, message, type };
  SOUNDS[type]?.();
  listeners.forEach(fn => fn(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (t: ToastData) => {
      setToasts(prev => [...prev, t]);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const dismiss = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} data={t} onDone={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ data, onDone }: { data: ToastData; onDone: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (exiting) {
      const timer = setTimeout(onDone, 300);
      return () => clearTimeout(timer);
    }
  }, [exiting, onDone]);

  return (
    <div className={`toast toast--${data.type} ${exiting ? 'toast--exit' : ''}`}>
      <span className="toast-icon">{ICONS[data.type]}</span>
      <span className="toast-msg">{data.message}</span>
      <button className="toast-close" onClick={() => setExiting(true)}>
        <X size={12} />
      </button>
      <div className="toast-progress" />
    </div>
  );
}
