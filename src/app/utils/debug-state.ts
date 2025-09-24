import { appState } from '../state/app.state';

/**
 * Debug utility for state management
 * Use this in browser console to check state
 */
export class DebugState {
  
  /**
   * Get current app state
   */
  static getCurrentState() {
    console.log('Current App State:', appState.state);
    return appState.state;
  }

  /**
   * Get localStorage data
   */
  static getLocalStorageState() {
    const data = localStorage.getItem('appState');
    console.log('LocalStorage appState:', data ? JSON.parse(data) : 'No data');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Check if user is authenticated
   */
  static checkAuth() {
    const isAuth = appState.isAuthenticated;
    const user = appState.user;
    console.log('Is Authenticated:', isAuth);
    console.log('User:', user);
    return { isAuthenticated: isAuth, user };
  }

  /**
   * Check store data
   */
  static checkStore() {
    const store = appState.store;
    console.log('Store:', store);
    return store;
  }

  /**
   * Test setting user data
   */
  static testSetUser() {
    appState.setUser({
      id: 'test-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    });
    console.log('Test user set');
  }

  /**
   * Test setting store data
   */
  static testSetStore() {
    appState.setStore({
      _id: 'store-123',
      name: 'Test Store',
      code: 'TEST',
      status: 'active',
      createdBy: 'test-user'
    });
    console.log('Test store set');
  }

  /**
   * Clear all state
   */
  static clearState() {
    appState.reset();
    console.log('State cleared');
  }

  /**
   * Full state report
   */
  static fullReport() {
    console.log('=== FULL STATE REPORT ===');
    this.getCurrentState();
    this.getLocalStorageState();
    this.checkAuth();
    this.checkStore();
    this.checkFirstStorePopup();
    console.log('=== END REPORT ===');
  }

  /**
   * Check first store popup status
   */
  static checkFirstStorePopup() {
    const popup = document.querySelector('app-first-store-create');
    const isVisible = popup && window.getComputedStyle(popup).display !== 'none';
    console.log('First Store Popup Element:', popup);
    console.log('First Store Popup Visible:', isVisible);
    console.log('App State Loading:', appState.loading);
    console.log('App State Authenticated:', appState.isAuthenticated);
    return { element: popup, visible: isVisible };
  }

  /**
   * Force refresh store data
   */
  static refreshStore() {
    console.log('Manually triggering store refresh...');
    // This will be available when the app component is loaded
    if ((window as any).appComponent) {
      (window as any).appComponent.checkAndSetStore();
    } else {
      console.warn('App component not available for manual store refresh');
    }
  }
}

// Make it available globally for browser console debugging
(window as any).DebugState = DebugState;
