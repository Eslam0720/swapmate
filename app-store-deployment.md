# App Store Deployment Guide for SwapMate

## Prerequisites

### For Google Play Store (Android)
- Google Play Console account ($25 one-time fee)
- Android Studio with latest SDK
- Java Development Kit (JDK) 11+
- Keystore file for app signing

### For Apple App Store (iOS)
- Apple Developer Program membership ($99/year)
- macOS with Xcode 12+
- iOS device for testing
- App Store Connect access

## Step 1: Prepare Your App

### Build Production Version
```bash
npm install
npm run build
npm run mobile:setup
```

### Update App Information
Edit `capacitor.config.ts`:
- Set proper `appId` (e.g., `com.swapmate.app`)
- Update `appName` to "SwapMate"
- Set correct `webDir` path

## Step 2: Android Play Store Deployment

### Generate Signed APK/AAB

1. **Create Keystore** (first time only):
```bash
keytool -genkey -v -keystore swapmate-release-key.keystore -alias swapmate -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure Signing in Android Studio**:
   - Open `android/` folder in Android Studio
   - Go to Build > Generate Signed Bundle/APK
   - Select "Android App Bundle" (recommended)
   - Use your keystore file

3. **Build Release Bundle**:
```bash
npm run android:build
```

### Upload to Play Console

1. **Create App Listing**:
   - Go to Google Play Console
   - Create new app
   - Fill in app details, descriptions, screenshots

2. **Upload Bundle**:
   - Go to Release > Production
   - Upload your AAB file
   - Complete store listing requirements

3. **Review and Publish**:
   - Submit for review
   - Review process takes 1-3 days

## Step 3: iOS App Store Deployment

### Configure iOS Project

1. **Open in Xcode**:
```bash
npm run cap:build:ios
```

2. **Set Bundle Identifier**:
   - In Xcode, select project root
   - Set Bundle Identifier (e.g., `com.swapmate.app`)
   - Must match App Store Connect

3. **Configure Signing**:
   - Select your Apple Developer Team
   - Enable "Automatically manage signing"

### Build for App Store

1. **Archive Build**:
   - In Xcode: Product > Archive
   - Wait for build to complete

2. **Upload to App Store**:
   - In Organizer window, click "Distribute App"
   - Select "App Store Connect"
   - Follow upload wizard

### App Store Connect Setup

1. **Create App Record**:
   - Go to App Store Connect
   - Create new app with same Bundle ID

2. **Fill App Information**:
   - App name: "SwapMate"
   - Description: "Swap Your Things In a Tap"
   - Keywords, categories, etc.

3. **Add Screenshots**:
   - iPhone screenshots (required)
   - iPad screenshots (if supported)
   - Use iOS Simulator to capture

4. **Submit for Review**:
   - Complete all required fields
   - Submit for Apple review
   - Review process takes 1-7 days

## Step 4: Store Listing Optimization

### App Store Assets Needed

**Screenshots** (capture from devices/simulators):
- iPhone: 6.7", 6.5", 5.5" displays
- Android: Phone and tablet sizes

**App Icons**:
- Android: 512x512 PNG
- iOS: 1024x1024 PNG (no transparency)

**Feature Graphics** (Android):
- 1024x500 PNG for Play Store header

### Store Descriptions

**Short Description** (80 chars):
"Swap items locally with SwapMate - Your neighborhood trading app"

**Long Description**:
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

## Step 5: Post-Launch

### Monitor Performance
- Check app store analytics
- Monitor user reviews and ratings
- Track download numbers

### Updates
- Regular bug fixes and feature updates
- Increment version numbers
- Follow same deployment process

### Marketing
- Social media promotion
- Local community outreach
- User referral programs

## Troubleshooting

**Common Android Issues**:
- Keystore password forgotten: Create new keystore
- Build fails: Check Android SDK versions
- Upload rejected: Verify target API level

**Common iOS Issues**:
- Signing errors: Check Apple Developer account
- Archive fails: Clean build folder
- Upload rejected: Check bundle identifier

**Both Platforms**:
- App rejected: Address store policy violations
- Crashes: Test thoroughly on real devices
- Performance: Optimize bundle size and loading

## Timeline Expectations

**Development to Store**:
- Android: 1-3 days review
- iOS: 1-7 days review
- Total: 1-2 weeks including preparation

**First Launch Checklist**:
- [ ] App builds successfully
- [ ] All features work on real devices
- [ ] Store listings complete
- [ ] Screenshots and assets ready
- [ ] Legal pages (privacy policy, terms)
- [ ] Analytics and crash reporting setup

Good luck with your app store launch! 🚀