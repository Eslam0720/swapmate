# Android Resources Setup for SwapMate

## Required Android Assets

To complete your Android app store deployment, you need to create these assets:

### 1. App Icons

Create these icon files in `android/app/src/main/res/`:

```
mipmap-hdpi/ic_launcher.png (72x72)
mipmap-mdpi/ic_launcher.png (48x48)
mipmap-xhdpi/ic_launcher.png (96x96)
mipmap-xxhdpi/ic_launcher.png (144x144)
mipmap-xxxhdpi/ic_launcher.png (192x192)
```

### 2. Splash Screen Images

Create these splash screen files in `android/app/src/main/res/`:

```
drawable/splash.png (320x480)
drawable-hdpi/splash.png (480x720)
drawable-xhdpi/splash.png (640x960)
drawable-xxhdpi/splash.png (960x1440)
drawable-xxxhdpi/splash.png (1280x1920)
```

### 3. Feature Graphic for Play Store

Create a feature graphic:
- Size: 1024x500 pixels
- Format: PNG or JPEG
- No transparency
- Showcases your app's main features

### 4. Screenshots for Play Store

Capture screenshots:
- Phone: At least 2 screenshots
- Tablet: At least 1 screenshot (if supporting tablets)
- Sizes: Various Android screen sizes

## Quick Setup Commands

After creating your assets:

```bash
# Build and sync
npm run build
npm run cap:sync

# Open in Android Studio
npm run cap:run:android
```

## Asset Creation Tips

### App Icon Design
- Use SwapMate logo/branding
- Ensure visibility at small sizes
- Follow Material Design guidelines
- No text in icon (use app name instead)

### Splash Screen Design
- Match your app's theme colors
- Include SwapMate logo
- Add "Swap Your Things In a Tap" slogan
- Keep it simple and fast-loading

### Screenshots
- Show key app features
- Use real content, not placeholder text
- Highlight unique selling points
- Include different screen states

## Automated Asset Generation

You can use tools like:
- **Capacitor Assets**: `npm install @capacitor/assets`
- **Android Asset Studio**: Online tool by Google
- **Figma/Sketch**: Design tools with export options

## Next Steps

1. Create all required assets
2. Place them in correct Android directories
3. Run `npm run cap:sync` to update
4. Test on Android device/emulator
5. Generate signed APK/AAB
6. Upload to Google Play Console

Refer to `app-store-deployment.md` for complete deployment instructions.