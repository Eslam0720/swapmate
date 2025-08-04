# iOS Resources Setup for SwapMate

## Required iOS Assets

To complete your iOS App Store deployment, you need to create these assets:

### 1. App Icons

Create these icon files in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:

```
icon-20.png (20x20)
icon-20@2x.png (40x40)
icon-20@3x.png (60x60)
icon-29.png (29x29)
icon-29@2x.png (58x58)
icon-29@3x.png (87x87)
icon-40.png (40x40)
icon-40@2x.png (80x80)
icon-40@3x.png (120x120)
icon-60@2x.png (120x120)
icon-60@3x.png (180x180)
icon-76.png (76x76)
icon-76@2x.png (152x152)
icon-83.5@2x.png (167x167)
icon-1024.png (1024x1024)
```

### 2. Launch Screen (Splash Screen)

Update `ios/App/App/Base.lproj/LaunchScreen.storyboard`:
- Add SwapMate logo
- Include "Swap Your Things In a Tap" slogan
- Match app's color scheme

### 3. App Store Assets

For App Store Connect, create:
- **App Store Icon**: 1024x1024 PNG (no transparency)
- **Screenshots**: Various iPhone/iPad sizes
- **App Preview Video** (optional): 15-30 seconds

### 4. Screenshots Required

**iPhone Screenshots** (required):
- 6.7" Display: 1290x2796 or 2796x1290
- 6.5" Display: 1242x2688 or 2688x1242
- 5.5" Display: 1242x2208 or 2208x1242

**iPad Screenshots** (if supporting iPad):
- 12.9" Display: 2048x2732 or 2732x2048
- 11" Display: 1668x2388 or 2388x1668

## Quick Setup Commands

After creating your assets:

```bash
# Build and sync
npm run build
npm run cap:sync

# Open in Xcode
npm run cap:run:ios
```

## Asset Creation in Xcode

### Setting Up App Icons

1. Open `ios/App/App.xcworkspace` in Xcode
2. Navigate to App > Assets.xcassets > AppIcon
3. Drag and drop your icon files to corresponding slots
4. Ensure all required sizes are filled

### Configuring Launch Screen

1. Open `LaunchScreen.storyboard`
2. Add image views for logo
3. Add labels for slogan text
4. Set constraints for different screen sizes
5. Test on various simulators

## Asset Design Guidelines

### App Icon Requirements
- **No transparency**: iOS icons cannot have transparent backgrounds
- **No text**: App name appears below icon
- **Consistent branding**: Use SwapMate colors and style
- **Scalable design**: Must look good at all sizes

### Launch Screen Best Practices
- **Fast loading**: Keep assets small
- **Brand consistent**: Match main app interface
- **No loading indicators**: iOS handles loading states
- **Static content**: No animations or interactive elements

## Screenshot Strategy

### What to Showcase
1. **Main browsing interface**: Show item grid/list
2. **Item details**: Display item photos and info
3. **Chat interface**: Show communication features
4. **Profile/listings**: User's own items
5. **Search/filters**: Discovery features

### Screenshot Tips
- Use real, attractive content
- Show app in use, not empty states
- Highlight unique features
- Use consistent lighting and style
- Include diverse, appealing items

## Automated Tools

### Icon Generation
```bash
# Install Capacitor Assets plugin
npm install @capacitor/assets --save-dev

# Generate icons from single source
npx capacitor-assets generate
```

### Screenshot Tools
- **iOS Simulator**: Built into Xcode
- **Device screenshots**: Use Xcode's device window
- **Automated tools**: Fastlane Snapshot

## App Store Connect Setup

### Required Information
- **App Name**: "SwapMate"
- **Subtitle**: "Swap Your Things In a Tap"
- **Bundle ID**: `com.swapmate.app`
- **Category**: Lifestyle or Shopping
- **Content Rating**: 4+ (suitable for all ages)

### App Description Template
```
Swap Your Things In a Tap!

SwapMate makes local item trading simple and fun. Connect with neighbors, discover unique items, and give your unused things a new life.

🔄 Easy Swapping: Browse, like, and trade items nearby
📍 Local Focus: Find traders in your neighborhood  
💬 Safe Communication: Built-in chat system
📸 Visual Discovery: Photo-rich item listings
🔔 Smart Notifications: Never miss a trading opportunity

Join the sustainable trading revolution. Download SwapMate today!
```

## Next Steps

1. Create all required assets using design tools
2. Add assets to Xcode project
3. Test on iOS Simulator and real devices
4. Archive and upload to App Store Connect
5. Complete App Store listing
6. Submit for Apple review

Refer to `app-store-deployment.md` for complete deployment workflow.