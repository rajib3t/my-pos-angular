import { signal, computed } from '@angular/core';

export interface AppState {
  loading: boolean;
  error: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  store: {
    _id: string;
    name: string;
    code: string;
    status: 'inactive' | 'active';
    createdBy: string;
  } | null;
}

const initialState: AppState = {
  loading: false,
  error: null,
  user: null,
  store: null
};

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
    this._state.update(state => ({ ...state, loading }));
  },
  
  setError(error: string | null) {
    this._state.update(state => ({ ...state, error }));
  },
  
  setUser(user: AppState['user']) {
    this._state.update(state => ({ ...state, user }));
  },
  
  setStore(store: AppState['store']) {
    this._state.update(state => ({ ...state, store }));
  },
  
  clearError() {
    this._state.update(state => ({ ...state, error: null }));
  },
  
  reset() {
    this._state.set(initialState);
  },

  // Generic state update function - supports both single key-value updates and partial state updates
  updateState<K extends keyof AppState>(keyOrUpdates: K | Partial<AppState>, value?: AppState[K]) {
    if (typeof keyOrUpdates === 'string') {
      // Single key-value update
      this._state.update(state => ({ ...state, [keyOrUpdates]: value }));
    } else {
      // Partial state update
      this._state.update(state => ({ ...state, ...keyOrUpdates }));
    }
  }
};