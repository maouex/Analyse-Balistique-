import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { toast } from '../toast/Toast';
import './InstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem('sag-pwa-dismissed') === '1'; } catch { return false; }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast('Application installée', 'success');
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem('sag-pwa-dismissed', '1'); } catch { /* */ }
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="install-prompt">
      <Download size={14} className="install-icon" />
      <span className="install-text">Installer S.A.G. en tant qu'application</span>
      <button className="install-btn" onClick={handleInstall}>
        INSTALLER
      </button>
      <button className="install-close" onClick={handleDismiss}>
        <X size={12} />
      </button>
    </div>
  );
}
