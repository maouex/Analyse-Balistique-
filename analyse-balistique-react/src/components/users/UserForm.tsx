import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useUserStore, ROLE_LABELS, ROLE_DESCRIPTIONS } from '../../stores/userStore';
import { toast } from '../toast/Toast';
import type { UserRole } from '../../types';

export function UserForm() {
  const { showForm, editingId, users, addUser, updateUser, changePassword, setShowForm } = useUserStore();
  const editing = editingId ? users.find((u) => u.id === editingId) : null;

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('operator');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changePass, setChangePass] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      setUsername(editing.username);
      setDisplayName(editing.displayName);
      setRole(editing.role);
      setPassword('');
      setChangePass(false);
    } else {
      setUsername('');
      setDisplayName('');
      setRole('operator');
      setPassword('');
      setChangePass(false);
    }
    setError('');
  }, [editing, showForm]);

  if (!showForm) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (editing) {
      const res = updateUser(editing.id, { username, displayName, role });
      if (!res.success) { setError(res.error!); return; }
      if (changePass && password.trim()) {
        if (password.trim().length < 4) { setError('Mot de passe trop court (min. 4)'); return; }
        changePassword(editing.id, password);
      }
      toast(`Utilisateur "${displayName}" mis à jour`, 'success');
    } else {
      const res = addUser({ username, displayName, role, password });
      if (!res.success) { setError(res.error!); return; }
      toast(`Utilisateur "${displayName || username}" créé`, 'success');
    }
  };

  return (
    <AnimatePresence>
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowForm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.form
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            style={{
              width: 420,
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={14} color="var(--accent2)" />
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '1px',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {editing ? 'MODIFIER UTILISATEUR' : 'NOUVEL UTILISATEUR'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  display: 'flex',
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Username */}
              <div>
                <label style={labelStyle}>Nom d'utilisateur</label>
                <input
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: jean.dupont"
                  autoFocus
                  required
                  style={{ width: '100%' }}
                />
              </div>

              {/* Display name */}
              <div>
                <label style={labelStyle}>Nom affiché</label>
                <input
                  className="input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ex: Jean Dupont"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Role */}
              <div>
                <label style={labelStyle}>Rôle</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                    <label
                      key={r}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '8px 10px',
                        border: role === r ? '1px solid var(--accent2)' : '1px solid var(--border)',
                        background: role === r ? 'var(--accent-glow)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        checked={role === r}
                        onChange={() => setRole(r)}
                        style={{ marginTop: 2, accentColor: 'var(--accent2)' }}
                      />
                      <div>
                        <div style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: role === r ? 'var(--accent2)' : 'var(--text)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {ROLE_LABELS[r]}
                        </div>
                        <div style={{
                          fontSize: 10,
                          color: 'var(--muted)',
                          marginTop: 2,
                        }}>
                          {ROLE_DESCRIPTIONS[r]}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Password */}
              {editing ? (
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={changePass}
                      onChange={(e) => setChangePass(e.target.checked)}
                      style={{ accentColor: 'var(--accent2)' }}
                    />
                    Changer le mot de passe
                  </label>
                  {changePass && (
                    <div style={{ position: 'relative', marginTop: 6 }}>
                      <input
                        className="input"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nouveau mot de passe"
                        style={{ width: '100%', paddingRight: 36 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={eyeStyle}
                      >
                        {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label style={labelStyle}>Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe"
                      required
                      style={{ width: '100%', paddingRight: 36 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={eyeStyle}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--red)',
                    padding: '6px 10px',
                    background: 'rgba(255,68,68,0.08)',
                    border: '1px solid rgba(255,68,68,0.2)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <AlertCircle size={12} />
                  {error}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              padding: '12px 18px',
              borderTop: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '6px 16px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.5px',
                }}
              >
                ANNULER
              </button>
              <button
                type="submit"
                style={{
                  padding: '6px 16px',
                  border: '1px solid var(--accent2)',
                  background: 'var(--accent-glow)',
                  color: 'var(--accent2)',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Save size={12} />
                {editing ? 'ENREGISTRER' : 'CRÉER'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  marginBottom: 5,
  fontFamily: 'var(--font-mono)',
};

const eyeStyle: React.CSSProperties = {
  position: 'absolute',
  right: 6,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted)',
  display: 'flex',
  padding: 4,
};
