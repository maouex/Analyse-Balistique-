import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Search, Shield, Crosshair, Eye,
  Edit3, Trash2, ToggleLeft, ToggleRight, Clock, AlertTriangle,
} from 'lucide-react';
import { useUserStore, ROLE_LABELS, canManageUsers } from '../stores/userStore';
import { UserForm } from '../components/users/UserForm';
import { toast } from '../components/toast/Toast';
import type { User, UserRole } from '../types';

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  admin: <Shield size={12} />,
  operator: <Crosshair size={12} />,
  viewer: <Eye size={12} />,
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'var(--accent2)',
  operator: 'var(--blue)',
  viewer: 'var(--muted)',
};

export function UsersPage() {
  const store = useUserStore();
  const currentUser = store.currentUser;
  const isAdmin = currentUser && canManageUsers(currentUser.role);
  const filtered = store.filtered();

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleToggleActive = (user: User) => {
    if (user.id === currentUser?.id) {
      toast('Impossible de désactiver votre propre compte', 'warning');
      return;
    }
    const res = store.updateUser(user.id, { active: !user.active });
    if (res.success) {
      toast(`${user.displayName} ${user.active ? 'désactivé' : 'activé'}`, 'success');
    } else {
      toast(res.error!, 'warning');
    }
  };

  const handleDelete = (user: User) => {
    const res = store.removeUser(user.id);
    if (res.success) {
      toast(`${user.displayName} supprimé`, 'success');
      setConfirmDelete(null);
    } else {
      toast(res.error!, 'warning');
    }
  };

  const stats = {
    total: store.users.length,
    admins: store.users.filter((u) => u.role === 'admin').length,
    operators: store.users.filter((u) => u.role === 'operator').length,
    viewers: store.users.filter((u) => u.role === 'viewer').length,
    active: store.users.filter((u) => u.active).length,
    inactive: store.users.filter((u) => !u.active).length,
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={16} color="var(--accent2)" />
          <span style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '1.5px',
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)',
          }}>
            GESTION UTILISATEURS
          </span>
          <span style={{
            fontSize: 10,
            color: 'var(--muted)',
            fontFamily: 'var(--font-mono)',
            padding: '2px 8px',
            border: '1px solid var(--border)',
            background: 'var(--surface-glass)',
          }}>
            {stats.total} utilisateur{stats.total > 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={12} color="var(--muted)" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="input"
              value={store.searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              style={{ paddingLeft: 28, width: 200, height: 30 }}
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => { store.setEditingId(null); store.setShowForm(true); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                border: '1px solid var(--accent2)',
                background: 'var(--accent-glow)',
                color: 'var(--accent2)',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.5px',
                transition: 'all 0.2s',
              }}
            >
              <UserPlus size={13} />
              AJOUTER
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '8px 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <StatBadge label="Admins" value={stats.admins} color="var(--accent2)" />
        <StatBadge label="Opérateurs" value={stats.operators} color="var(--blue)" />
        <StatBadge label="Lecteurs" value={stats.viewers} color="var(--muted)" />
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <StatBadge label="Actifs" value={stats.active} color="var(--green)" />
        {stats.inactive > 0 && <StatBadge label="Inactifs" value={stats.inactive} color="var(--red)" />}
      </div>

      {/* User list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        {filtered.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--muted)',
          }}>
            <Users size={32} />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              {store.searchQuery ? 'Aucun résultat' : 'Aucun utilisateur'}
            </span>
          </div>
        ) : (
          filtered.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                border: '1px solid var(--border)',
                background: user.active ? 'var(--surface)' : 'rgba(255,68,68,0.03)',
                opacity: user.active ? 1 : 0.6,
                transition: 'all 0.2s',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: `${user.avatar}15`,
                border: `2px solid ${user.avatar}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: user.avatar,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {user.displayName.slice(0, 2).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: user.active ? 'var(--text)' : 'var(--muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.displayName}
                  </span>
                  {currentUser?.id === user.id && (
                    <span style={{
                      fontSize: 8,
                      fontWeight: 800,
                      color: 'var(--accent2)',
                      padding: '1px 5px',
                      border: '1px solid var(--accent2)',
                      letterSpacing: '1px',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      VOUS
                    </span>
                  )}
                  {!user.active && (
                    <span style={{
                      fontSize: 8,
                      fontWeight: 800,
                      color: 'var(--red)',
                      padding: '1px 5px',
                      border: '1px solid rgba(255,68,68,0.3)',
                      letterSpacing: '1px',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      DÉSACTIVÉ
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span style={{
                    fontSize: 10,
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    @{user.username}
                  </span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: 9,
                    fontWeight: 700,
                    color: ROLE_COLORS[user.role],
                    padding: '1px 6px',
                    background: `${ROLE_COLORS[user.role]}10`,
                    border: `1px solid ${ROLE_COLORS[user.role]}20`,
                    letterSpacing: '0.5px',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                  }}>
                    {ROLE_ICONS[user.role]}
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>

              {/* Last login */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <Clock size={10} color="var(--muted)" />
                <span style={{
                  fontSize: 9,
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : 'Jamais connecté'}
                </span>
              </div>

              {/* Actions */}
              {isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => store.setEditingId(user.id)}
                    title="Modifier"
                    style={actionBtnStyle}
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(user)}
                    title={user.active ? 'Désactiver' : 'Activer'}
                    style={{
                      ...actionBtnStyle,
                      color: user.active ? 'var(--amber)' : 'var(--green)',
                      borderColor: user.active ? 'rgba(255,170,0,0.2)' : 'rgba(0,255,65,0.2)',
                    }}
                  >
                    {user.active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                  </button>
                  {currentUser?.id !== user.id && (
                    <>
                      {confirmDelete === user.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button
                            onClick={() => handleDelete(user)}
                            style={{
                              ...actionBtnStyle,
                              color: '#fff',
                              background: 'var(--red)',
                              borderColor: 'var(--red)',
                              fontSize: 9,
                              padding: '3px 8px',
                              width: 'auto',
                            }}
                          >
                            CONFIRMER
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            style={{ ...actionBtnStyle, fontSize: 9, padding: '3px 6px', width: 'auto' }}
                          >
                            NON
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(user.id)}
                          title="Supprimer"
                          style={{
                            ...actionBtnStyle,
                            color: 'var(--red)',
                            borderColor: 'rgba(255,68,68,0.2)',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Non-admin warning */}
      {!isAdmin && (
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,170,0,0.05)',
        }}>
          <AlertTriangle size={13} color="var(--amber)" />
          <span style={{ fontSize: 11, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
            Accès en lecture seule — seuls les administrateurs peuvent gérer les utilisateurs
          </span>
        </div>
      )}

      <UserForm />
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 8px',
      border: `1px solid ${color}20`,
      background: `${color}08`,
      fontSize: 10,
      fontFamily: 'var(--font-mono)',
    }}>
      <span style={{ fontWeight: 800, color }}>{value}</span>
      <span style={{ color: 'var(--muted)', fontSize: 9, letterSpacing: '0.5px' }}>{label}</span>
    </div>
  );
}

const actionBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  border: '1px solid var(--border)',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--muted)',
  transition: 'all 0.15s',
  fontFamily: 'var(--font-mono)',
  fontWeight: 700,
};
