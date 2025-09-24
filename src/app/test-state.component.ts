import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { appState } from './state/app.state';

@Component({
  selector: 'app-test-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-gray-100 rounded-lg">
      <h2 class="text-xl font-bold mb-4">State Test Component</h2>
      
      <div class="mb-4">
        <h3 class="font-semibold">App State:</h3>
        <pre class="bg-white p-2 rounded text-sm">{{ appStateJson }}</pre>
      </div>
      
      <div class="mb-4">
        <h3 class="font-semibold">User:</h3>
        <p>{{ user ? user.name + ' (' + user.email + ')' : 'No user' }}</p>
      </div>
      
      <div class="mb-4">
        <h3 class="font-semibold">Store:</h3>
        <p>{{ store ? store.name + ' (' + store._id + ')' : 'No store' }}</p>
      </div>
      
      <div class="mb-4">
        <h3 class="font-semibold">LocalStorage:</h3>
        <pre class="bg-white p-2 rounded text-sm">{{ localStorageData }}</pre>
      </div>
      
      <button 
        (click)="testSetStore()" 
        class="bg-blue-500 text-white px-4 py-2 rounded mr-2">
        Test Set Store
      </button>
      
      <button 
        (click)="testSetUser()" 
        class="bg-green-500 text-white px-4 py-2 rounded mr-2">
        Test Set User
      </button>
      
      <button 
        (click)="clearState()" 
        class="bg-red-500 text-white px-4 py-2 rounded">
        Clear State
      </button>
    </div>
  `
})
export class TestStateComponent implements OnInit {
  appStateJson = '';
  user: any = null;
  store: any = null;
  localStorageData = '';

  constructor() {
    // Watch for state changes
    effect(() => {
      const state = appState.state;
      this.appStateJson = JSON.stringify(state, null, 2);
      this.user = state.user;
      this.store = state.store;
      this.updateLocalStorageData();
    });
  }

  ngOnInit() {
    this.updateLocalStorageData();
    console.log('TestStateComponent: Initial state:', appState.state);
  }

  updateLocalStorageData() {
    const data = localStorage.getItem('appState');
    this.localStorageData = data ? JSON.stringify(JSON.parse(data), null, 2) : 'No data';
  }

  testSetStore() {
    appState.setStore({
      _id: 'test-store-123',
      name: 'Test Store',
      code: 'TEST',
      status: 'active',
      createdBy: 'test-user'
    });
    console.log('Test store set');
  }

  testSetUser() {
    appState.setUser({
      id: 'test-user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    });
    console.log('Test user set');
  }

  clearState() {
    appState.reset();
    this.updateLocalStorageData();
    console.log('State cleared');
  }
}
