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
}

const initialState: AppState = {
  loading: false,
  error: null,
  user: null
};

interface AppStateMethods {
  // State
  _state: ReturnType<typeof signal<AppState>>;
  
  // Selectors
  readonly state: AppState;
  readonly loading: boolean;
  readonly error: string | null;
  readonly user: AppState['user'];
  readonly isAuthenticated: boolean;
  
  // Actions
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  setUser(user: AppState['user']): void;
  clearError(): void;
  reset(): void;
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
  
  clearError() {
    this._state.update(state => ({ ...state, error: null }));
  },
  
  reset() {
    this._state.set(initialState);
  }
};
