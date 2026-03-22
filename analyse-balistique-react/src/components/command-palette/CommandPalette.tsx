import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LayoutGrid, Scan, BookOpen, Box, Sun, Moon, Search, ArrowRight, Keyboard } from 'lucide-react';
import { useTransitionNavigate } from '../transitions/TransitionContext';
import { useThemeStore } from '../../stores/themeStore';
import { playClick } from '../../lib/sounds';
import './CommandPalette.css';

interface Command {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useTransitionNavigate();
  const { mode, toggle } = useThemeStore();

  const commands = useMemo<Command[]>(() => [
    { id: 'nav-dashboard', label: 'Aller au Dashboard', category: 'Navigation', icon: <LayoutGrid size={16} />, shortcut: 'G D', action: () => navigate('/dashboard') },
    { id: 'nav-analyse', label: 'Aller à l\'Analyse', category: 'Navigation', icon: <Scan size={16} />, shortcut: 'G A', action: () => navigate('/analyse') },
    { id: 'nav-biblio', label: 'Aller à la Bibliothèque', category: 'Navigation', icon: <BookOpen size={16} />, shortcut: 'G B', action: () => navigate('/bibliotheque') },
    { id: 'nav-3d', label: 'Aller à la Vue 3D', category: 'Navigation', icon: <Box size={16} />, shortcut: 'G 3', action: () => navigate('/3d') },
    { id: 'toggle-theme', label: `Passer en mode ${mode === 'dark' ? 'clair' : 'sombre'}`, category: 'Préférences', icon: mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />, action: () => toggle() },
    { id: 'shortcuts', label: 'Afficher les raccourcis clavier', category: 'Aide', icon: <Keyboard size={16} />, shortcut: '?', action: () => { /* handled inline */ } },
  ], [navigate, mode, toggle]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [query, commands]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [filtered.length]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const execute = useCallback((cmd: Command) => {
    playClick();
    close();
    requestAnimationFrame(() => cmd.action());
  }, [close]);

  // Global keyboard handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape' && open) {
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Arrow key navigation
  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      e.preventDefault();
      execute(filtered[selectedIdx]);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  if (!open) return null;

  // Group by category
  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    (acc[cmd.category] ??= []).push(cmd);
    return acc;
  }, {});

  let flatIdx = 0;

  return (
    <div className="cmd-overlay" onClick={close}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <Search size={16} className="cmd-search-icon" />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Rechercher une commande..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onInputKey}
          />
          <kbd className="cmd-kbd">ESC</kbd>
        </div>
        <div className="cmd-list" ref={listRef}>
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category}>
              <div className="cmd-category">{category}</div>
              {cmds.map(cmd => {
                const idx = flatIdx++;
                return (
                  <button
                    key={cmd.id}
                    className={`cmd-item ${idx === selectedIdx ? 'cmd-item--active' : ''}`}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    onClick={() => execute(cmd)}
                  >
                    <span className="cmd-item-icon">{cmd.icon}</span>
                    <span className="cmd-item-label">{cmd.label}</span>
                    <span className="cmd-item-right">
                      {cmd.shortcut && <kbd className="cmd-kbd-sm">{cmd.shortcut}</kbd>}
                      <ArrowRight size={12} className="cmd-arrow" />
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="cmd-empty">Aucun résultat pour "{query}"</div>
          )}
        </div>
        <div className="cmd-footer">
          <span><kbd className="cmd-kbd-sm">↑↓</kbd> naviguer</span>
          <span><kbd className="cmd-kbd-sm">↵</kbd> exécuter</span>
          <span><kbd className="cmd-kbd-sm">ESC</kbd> fermer</span>
        </div>
      </div>
    </div>
  );
}
