# Store Not Setting Properly - Debug Guide

## Issue Description
After login, the store is not being set properly in the app state, causing the header and settings page to not display store information.

## Debugging Steps

### Step 1: Check Console Logs After Login
After logging in, check the browser console for these messages:

**Expected Flow:**
```
App: User is authenticated, initializing user data and store...
App: User data received: {user data}
AppState: Setting user: {user data}
App: Fetching store data...
App: Store API response: {store response}
App: First store found: {store data}
AppState: Setting store: {store data}
Persisting state to localStorage: {user and store data}
```

**If you see errors or missing messages, note which step is failing.**

### Step 2: Manual Debug Commands
Run these in browser console after login:

```javascript
// Check current app state
DebugState.fullReport()

// Check if store API works manually
DebugState.refreshStore()

// Check localStorage
localStorage.getItem('appState')

// Check if first store popup should show
document.querySelector('app-first-store-create')
```

### Step 3: Check First Store Create Component
The first store create popup should appear if:
1. User is in tenant mode (subdomain)
2. No store exists in app state
3. User is authenticated

**Debug the popup:**
```javascript
// Check if popup is visible
document.querySelector('app-first-store-create')?.style.display

// Check app state store
appState.store

// Check tenant mode
window.location.hostname !== 'localhost' // or your main domain
```

## Common Issues and Solutions

### Issue 1: Store API Call Failing
**Symptoms:** Console shows "App: Store check failed" error
**Check:**
- API endpoint `/tenants/stores` is correct
- User has proper authentication
- Network tab shows the API call

**Solution:**
```javascript
// Test API call manually
fetch('/api/tenants/stores?page=1&limit=1&timezone=-330', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
  }
})
.then(r => r.json())
.then(console.log)
```

### Issue 2: Store API Returns Empty Response
**Symptoms:** Console shows "App: No stores found in response"
**Cause:** User doesn't have any stores created yet
**Solution:** Create first store using the popup

### Issue 3: First Store Popup Not Showing
**Symptoms:** No popup appears even when no store exists
**Check:**
1. Are you on a subdomain (tenant mode)?
2. Is the user authenticated?
3. Check console for "FirstStoreCreate: Store state changed"

**Debug:**
```javascript
// Check tenant mode
const isTenantMode = window.location.hostname !== 'localhost'
console.log('Tenant mode:', isTenantMode)

// Check store state
console.log('Store exists:', appState.store !== null)
```

### Issue 4: Store Created But Not Persisting
**Symptoms:** Store created successfully but disappears on refresh
**Check:**
1. Console shows "AppState: Setting store"
2. localStorage contains store data
3. No errors in state persistence

**Debug:**
```javascript
// Check if store was saved
const saved = JSON.parse(localStorage.getItem('appState') || '{}')
console.log('Saved store:', saved.store)
```

### Issue 5: Timing Issues
**Symptoms:** Store fetch happens before user authentication
**Check:** Sequence of console messages
**Solution:** Store fetch should only happen after user data is received

## Manual Store Creation Test

If automatic store fetching isn't working, test manual store creation:

```javascript
// Test setting store manually
DebugState.testSetStore()

// Check if it persists
DebugState.getLocalStorageState()

// Refresh page and check again
location.reload()
// After reload:
DebugState.getCurrentState()
```

## API Response Format Check

The store API should return data in this format:
```json
{
  "data": {
    "data": {
      "items": [
        {
          "_id": "store-id",
          "name": "Store Name",
          "code": "STORE",
          "status": "active",
          "createdBy": "user-id"
        }
      ],
      "total": 1
    }
  }
}
```

## Quick Fixes

### Fix 1: Force Store Refresh
```javascript
// In browser console
DebugState.refreshStore()
```

### Fix 2: Clear State and Re-login
```javascript
// Clear all state
DebugState.clearState()
// Then logout and login again
```

### Fix 3: Create Store Manually (if no stores exist)
1. Navigate to tenant subdomain
2. First store popup should appear
3. Fill form and create store
4. Check if store is set in state

## Expected Behavior After Fixes

1. **After Login:**
   - Store data fetched automatically
   - Store set in app state
   - Store persisted to localStorage

2. **If No Store Exists:**
   - First store popup appears (in tenant mode)
   - User can create store
   - Store immediately set in app state

3. **After Page Refresh:**
   - Store data restored from localStorage
   - Header shows store info
   - Settings page loads with store data

## Contact Support

If none of these steps resolve the issue, provide:
1. Console log output after login
2. Network tab showing API calls
3. Current app state (`DebugState.fullReport()`)
4. Whether you're on main domain or subdomain
