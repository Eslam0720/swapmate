# Mobile Deployment Guide for SwapMate

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. One-Command Mobile Setup
```bash
npm run mobile:setup
```
This builds the web app, adds Android/iOS platforms, and syncs everything.

### 3. Run on Device

**Android:**
```bash
npm run cap:build:android
```

**iOS (macOS only):**
```bash
npm run cap:build:ios
```

## Prerequisites

### Android Development
- **Android Studio** with latest SDK
- **Java Development Kit (JDK) 11+**
- **Android SDK** (API level 22+)
- **Android device** or emulator

### iOS Development (macOS only)
- **Xcode 12+**
- **iOS Simulator** or physical iOS device
- **Apple Developer Account** (for device testing)

## Step-by-Step Deployment

### Android Deployment

1. **Build web assets:**
   ```bash
   npm run build
   ```

2. **Add Android platform** (first time only):
   ```bash
   npm run cap:add:android
   ```

3. **Sync web assets to Android:**
   ```bash
   npm run cap:sync
   ```

4. **Open in Android Studio:**
   ```bash
   npm run cap:run:android
   ```

5. **In Android Studio:**
   - Connect Android device or start emulator
   - Click "Run" button or press Shift+F10
   - App will install and launch on device

### iOS Deployment (macOS only)

1. **Build web assets:**
   ```bash
   npm run build
   ```

2. **Add iOS platform** (first time only):
   ```bash
   npm run cap:add:ios
   ```

3. **Sync web assets to iOS:**
   ```bash
   npm run cap:sync
   ```

4. **Open in Xcode:**
   ```bash
   npm run cap:run:ios
   ```

5. **In Xcode:**
   - Select target device or simulator
   - Click "Play" button or press Cmd+R
   - App will install and launch on device

## Troubleshooting

### Common Issues

**Build fails:**
- Ensure `npm run build` completes successfully first
- Check that all dependencies are installed

**Android Studio won't open:**
- Make sure Android Studio is installed and in PATH
- Try opening manually: `android/` folder in Android Studio

**Xcode won't open:**
- Make sure Xcode is installed from App Store
- Try opening manually: `ios/App.xcworkspace` in Xcode

**App crashes on startup:**
- Check browser console in development
- Ensure all Capacitor plugins are properly configured
- Verify Supabase configuration is correct

### Development Workflow

1. **Make changes** to React code
2. **Test in browser** with `npm run dev`
3. **Build for mobile** with `npm run build`
4. **Sync changes** with `npm run cap:sync`
5. **Test on device** with Android Studio/Xcode

### Production Builds

**Android APK:**
1. Open `android/` in Android Studio
2. Build > Generate Signed Bundle/APK
3. Follow Android signing process

**iOS App Store:**
1. Open `ios/App.xcworkspace` in Xcode
2. Product > Archive
3. Upload to App Store Connect

## Configuration Files

- `capacitor.config.ts` - Capacitor configuration
- `android/` - Android native project
- `ios/` - iOS native project
- `public/manifest.json` - PWA manifest

## Native Features

The app includes these native capabilities:
- Push notifications
- Local notifications
- Camera access
- File system access
- Network status
- Splash screen
- Status bar styling

All configured in `capacitor.config.ts` and implemented via Capacitor plugins.