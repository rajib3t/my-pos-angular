import { signal, computed } from '@angular/core';
import { User } from '../services/user.service';

export interface AppState {
  loading: boolean;
  error: string | null;
  user: User | null;
  store: {
    _id: string;
    name: string;
    code: string;
    status: 'inactive' | 'active';
    createdBy: string;
  } | null;
}

// Storage key for persisting state
const APP_STATE_STORAGE_KEY = 'appState';

// Function to load state from localStorage
function loadPersistedState(): AppState {
  try {
    const persistedState = localStorage.getItem(APP_STATE_STORAGE_KEY);
    if (persistedState) {
      const parsed = JSON.parse(persistedState);
      // Only restore non-loading state and exclude error state
      return {
        loading: false, // Always start with loading false
        error: null, // Don't persist errors
        user: parsed.user || null,
        store: parsed.store || null
      };
    }
  } catch (error) {
    console.error('Error loading persisted state:', error);
    localStorage.removeItem(APP_STATE_STORAGE_KEY);
  }
  return {
    loading: false,
    error: null,
    user: null,
    store: null
  };
}

// Function to persist state to localStorage
function persistState(state: AppState): void {
  try {
    // Only persist user and store data, not loading/error states
    const stateToPersist = {
      user: state.user,
      store: state.store
    };
    localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(stateToPersist));
  } catch (error) {
    console.error('Error persisting state:', error);
  }
}

const initialState: AppState = loadPersistedState();

interface AppStateMethods {
  // State
  _state: ReturnType<typeof signal<AppState>>;
  
  // Selectors
  readonly state: AppState;
  readonly loading: boolean;
  readonly error: string | null;
  readonly user: AppState['user'];
  readonly store: AppState['store'];
  readonly isAuthenticated: boolean;
  
  // Actions
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  setUser(user: AppState['user']): void;
  setStore(store: AppState['store']): void;
  clearError(): void;
  reset(): void;
  
  // Generic state update function
  updateState<K extends keyof AppState>(key: K, value: AppState[K]): void;
  updateState(updates: Partial<AppState>): void;
}

export const appState: AppStateMethods = {
  // State
  _state: signal<AppState>(initialState),

  // Selectors
  get state() {
    return this._state();
  },
  get loading() {
    return this._state().loading;
  },
  get error() {
    return this._state().error ?? null;
  },
  get user() {
    return this._state().user ?? null;
  },
  get store() {
    return this._state().store ?? null;
  },
  get isAuthenticated() {
    return this._state().user !== null;
  },

  // Actions
  setLoading(loading: boolean) {
    this._state.update(state => {
      const newState = { ...state, loading };
      // Don't persist loading state
      return newState;
    });
  },
  
  setError(error: string | null) {
    this._state.update(state => {
      const newState = { ...state, error };
      // Don't persist error state
      return newState;
    });
  },
  
  setUser(user: AppState['user']) {
    this._state.update(state => {
      const newState = { ...state, user };
      persistState(newState);
      return newState;
    });
  },
  
  setStore(store: AppState['store']) {
    this._state.update(state => {
      const newState = { ...state, store };
      persistState(newState);
      return newState;
    });
  },
  
  clearError() {
    this._state.update(state => ({ ...state, error: null }));
  },
  
  reset() {
    const resetState = {
      loading: false,
      error: null,
      user: null,
      store: null
    };
    this._state.set(resetState);
    // Clear persisted state
    localStorage.removeItem(APP_STATE_STORAGE_KEY);
  },

  // Generic state update function - supports both single key-value updates and partial state updates
  updateState<K extends keyof AppState>(keyOrUpdates: K | Partial<AppState>, value?: AppState[K]) {
    if (typeof keyOrUpdates === 'string') {
      // Single key-value update
      this._state.update(state => {
        const newState = { ...state, [keyOrUpdates]: value };
        // Only persist if updating user or store
        if (keyOrUpdates === 'user' || keyOrUpdates === 'store') {
          persistState(newState);
        }
        return newState;
      });
    } else {
      // Partial state update
      this._state.update(state => {
        const newState = { ...state, ...keyOrUpdates };
        // Persist if user or store data is being updated
        if ('user' in keyOrUpdates || 'store' in keyOrUpdates) {
          persistState(newState);
        }
        return newState;
      });
    }
  }
};