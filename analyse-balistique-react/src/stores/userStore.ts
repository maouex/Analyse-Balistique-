import { create } from 'zustand';
import type { User, UserRole } from '../types';

const STORAGE_KEY = 'sag_users';
const SESSION_KEY = 'sag-current-user';

// ─── Hash utility (same as LoginScreen) ─────────────────────
function simpleHash(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(16).slice(2, 8);
}

const AVATAR_COLORS = [
  '#00ff41', '#44aaff', '#aa66ff', '#ffaa00', '#ff4444',
  '#00ddcc', '#ff66aa', '#88cc00', '#ff8844', '#6688ff',
];

function pickAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// ─── Default admin user ─────────────────────────────────────
const DEFAULT_ADMIN: User = {
  id: 'admin-default',
  username: 'admin',
  displayName: 'Administrateur',
  role: 'admin',
  passwordHash: simpleHash('taradeau'),
  avatar: '#00ff41',
  active: true,
  lastLogin: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ─── Persistence ────────────────────────────────────────────
function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const users = JSON.parse(raw) as User[];
      if (users.length > 0) return users;
    }
  } catch { /* empty */ }
  // Seed default admin
  const initial = [DEFAULT_ADMIN];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function persistUsers(users: User[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

function loadCurrentUser(): User | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return null;
}

// ─── Role labels & permissions ──────────────────────────────
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  operator: 'Opérateur',
  viewer: 'Lecteur',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Accès complet — gestion des utilisateurs, analyses, bibliothèque',
  operator: 'Analyses et bibliothèque — pas de gestion utilisateurs',
  viewer: 'Consultation seule — lecture des analyses et bibliothèque',
};

export function canManageUsers(role: UserRole): boolean {
  return role === 'admin';
}

export function canAnalyse(role: UserRole): boolean {
  return role === 'admin' || role === 'operator';
}

export function canEditLibrary(role: UserRole): boolean {
  return role === 'admin' || role === 'operator';
}

// ─── Store ──────────────────────────────────────────────────
interface UserStore {
  users: User[];
  currentUser: User | null;
  searchQuery: string;
  showForm: boolean;
  editingId: string | null;

  // Auth
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  // CRUD
  addUser: (data: {
    username: string;
    displayName: string;
    role: UserRole;
    password: string;
  }) => { success: boolean; error?: string };
  updateUser: (id: string, updates: Partial<Pick<User, 'displayName' | 'role' | 'active' | 'username'>>) => { success: boolean; error?: string };
  changePassword: (id: string, newPassword: string) => void;
  removeUser: (id: string) => { success: boolean; error?: string };

  // UI
  setSearchQuery: (q: string) => void;
  setShowForm: (show: boolean) => void;
  setEditingId: (id: string | null) => void;
  filtered: () => User[];
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: loadUsers(),
  currentUser: loadCurrentUser(),
  searchQuery: '',
  showForm: false,
  editingId: null,

  login: (username, password) => {
    const users = get().users;
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase().trim()
    );
    if (!user) return { success: false, error: 'Utilisateur introuvable' };
    if (!user.active) return { success: false, error: 'Compte désactivé' };
    if (user.passwordHash !== simpleHash(password.trim())) {
      return { success: false, error: 'Mot de passe incorrect' };
    }

    const now = new Date().toISOString();
    const updated = users.map((u) =>
      u.id === user.id ? { ...u, lastLogin: now } : u
    );
    persistUsers(updated);

    const loggedIn = { ...user, lastLogin: now };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(loggedIn));
    sessionStorage.setItem('sag-auth', '1');

    set({ users: updated, currentUser: loggedIn });
    return { success: true };
  },

  logout: () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('sag-auth');
    set({ currentUser: null });
  },

  addUser: (data) => {
    const users = get().users;
    if (users.some((u) => u.username.toLowerCase() === data.username.toLowerCase().trim())) {
      return { success: false, error: 'Ce nom d\'utilisateur existe déjà' };
    }
    if (data.username.trim().length < 3) {
      return { success: false, error: 'Nom d\'utilisateur trop court (min. 3 caractères)' };
    }
    if (data.password.length < 4) {
      return { success: false, error: 'Mot de passe trop court (min. 4 caractères)' };
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: generateId(),
      username: data.username.trim().toLowerCase(),
      displayName: data.displayName.trim() || data.username.trim(),
      role: data.role,
      passwordHash: simpleHash(data.password.trim()),
      avatar: pickAvatarColor(),
      active: true,
      lastLogin: null,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...users, newUser];
    persistUsers(updated);
    set({ users: updated, showForm: false, editingId: null });
    return { success: true };
  },

  updateUser: (id, updates) => {
    const users = get().users;
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return { success: false, error: 'Utilisateur introuvable' };

    if (updates.username) {
      const exists = users.some(
        (u) => u.id !== id && u.username.toLowerCase() === updates.username!.toLowerCase().trim()
      );
      if (exists) return { success: false, error: 'Ce nom d\'utilisateur existe déjà' };
    }

    const updated = [...users];
    updated[idx] = {
      ...updated[idx],
      ...updates,
      ...(updates.username ? { username: updates.username.trim().toLowerCase() } : {}),
      updatedAt: new Date().toISOString(),
    };
    persistUsers(updated);

    // Update currentUser if editing self
    const current = get().currentUser;
    if (current && current.id === id) {
      const refreshed = updated[idx];
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(refreshed));
      set({ users: updated, currentUser: refreshed, showForm: false, editingId: null });
    } else {
      set({ users: updated, showForm: false, editingId: null });
    }
    return { success: true };
  },

  changePassword: (id, newPassword) => {
    const users = get().users;
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return;

    const updated = [...users];
    updated[idx] = {
      ...updated[idx],
      passwordHash: simpleHash(newPassword.trim()),
      updatedAt: new Date().toISOString(),
    };
    persistUsers(updated);
    set({ users: updated });
  },

  removeUser: (id) => {
    const users = get().users;
    const user = users.find((u) => u.id === id);
    if (!user) return { success: false, error: 'Utilisateur introuvable' };

    // Prevent deleting the last admin
    const adminCount = users.filter((u) => u.role === 'admin' && u.active).length;
    if (user.role === 'admin' && adminCount <= 1) {
      return { success: false, error: 'Impossible de supprimer le dernier administrateur' };
    }

    const current = get().currentUser;
    if (current && current.id === id) {
      return { success: false, error: 'Impossible de supprimer votre propre compte' };
    }

    const updated = users.filter((u) => u.id !== id);
    persistUsers(updated);
    set({ users: updated });
    return { success: true };
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setShowForm: (show) => set({ showForm: show, editingId: show ? get().editingId : null }),
  setEditingId: (id) => set({ editingId: id, showForm: id !== null }),

  filtered: () => {
    const { users, searchQuery } = get();
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        ROLE_LABELS[u.role].toLowerCase().includes(q)
    );
  },
}));
