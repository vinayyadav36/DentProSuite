# Mobile App (Capacitor) Readiness

DentProSuite frontend is structured for easy wrapping into native iOS and Android apps using **Capacitor**.

## Current Implementation Status
- **Responsive UI**: Built with Tailwind CSS for all screen sizes.
- **PWA Support**: Service worker with offline caching, standalone display mode.
- **Environment-Driven**: No hardcoded URLs — all config via `import.meta.env.VITE_*`.
- **Offline Capable**: Forms and appointments work offline and sync on reconnect.
- **Sync Status**: Visual sync queue indicator in the app header.
- **Mobile-Safe Routing**: Vue Router with `createWebHistory()` — compatible with Capacitor's `@capacitor/app` for deep linking.

## Future Steps to Generate APK/IPA

1. Install Capacitor:
   ```bash
   cd frontend
   npm install @capacitor/core @capacitor/cli
   npx cap init
   npm install @capacitor/android @capacitor/ios
   ```

2. Set hash history for Capacitor (required for `file://` protocol):
   ```bash
   # Add to frontend/.env or frontend/.env.production
   VITE_USE_HASH_HISTORY=true
   ```

3. Build the Vite project:
   ```bash
   npm run build
   ```

4. Add native platforms:
   ```bash
   npx cap add android
   npx cap add ios
   ```

5. Copy web assets into native shells:
   ```bash
   npx cap sync
   ```

6. Open Android Studio / XCode to compile and publish.

## Architecture Notes for Capacitor
- All API URLs use environment variables — no hardcoded values
- IndexedDB for offline storage works in WebView (supported in both Android and iOS)
- **Vue Router**: Uses `createWebHistory()` by default. For Capacitor, set `VITE_USE_HASH_HISTORY=true` to switch to `createWebHashHistory()` (required for `file://` protocol). Use `@capacitor/app` `appUrlOpen` listener for deep links if using hash history.
- PWA already provides offline support; Capacitor enhances with native APIs (camera, file system, etc.)
