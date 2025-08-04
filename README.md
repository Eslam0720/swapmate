# SwapMate - Mobile Trading App

A React-based mobile application for trading and swapping items, built with Vite, TypeScript, and Capacitor for cross-platform deployment.

## Features

- 🔄 Swipe interface for browsing items
- 📱 Mobile-first design with PWA capabilities
- 🗺️ Location-based search with Google Maps integration
- 💬 Real-time chat between matched users
- 🔔 Push notifications for matches and messages
- 📸 Image upload and carousel for listings
- 👤 User profiles and authentication
- 🎯 Advanced filtering and sorting options

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Mobile**: Capacitor for Android/iOS deployment
- **Maps**: Google Maps API
- **UI Components**: Radix UI with shadcn/ui
- **Build Tool**: Vite

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Mobile Deployment

### Prerequisites

- **Android**: Android Studio with SDK
- **iOS**: Xcode (macOS only)
- Node.js 16+ and npm

### Setup Mobile Platforms

1. **Initial mobile setup** (run once):
   ```bash
   npm run mobile:setup
   ```

2. **Or add platforms individually**:
   ```bash
   npm run cap:add:android
   npm run cap:add:ios
   ```

### Android Deployment

1. **Build and run on Android**:
   ```bash
   npm run cap:build:android
   ```

2. **Or sync and run separately**:
   ```bash
   npm run build
   npm run cap:sync
   npm run cap:run:android
   ```

### iOS Deployment

1. **Build and run on iOS** (macOS only):
   ```bash
   npm run cap:build:ios
   ```

2. **Or sync and run separately**:
   ```bash
   npm run build
   npm run cap:sync
   npm run cap:run:ios
   ```

### Manual Capacitor Commands

- **Sync web assets**: `npm run cap:sync`
- **Run on Android**: `npm run cap:run:android`
- **Run on iOS**: `npm run cap:run:ios`

## Environment Setup

The app uses Supabase for backend services. The configuration is handled through the Supabase client setup.

## Project Structure

```
src/
├── components/          # React components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
├── data/               # Static data files
└── utils/              # Helper functions
```

## Key Features Implementation

- **Authentication**: Supabase Auth with email/password
- **Real-time**: Supabase Realtime for live updates
- **File Storage**: Supabase Storage for images
- **Push Notifications**: Capacitor Push Notifications
- **Offline Support**: Service Worker and PWA manifest
- **Maps Integration**: Google Maps with location search

## Deployment Notes

- The app is configured for both web and mobile deployment
- Capacitor handles the native app wrapper
- All web assets are built to `dist/` directory
- Mobile apps use the built web assets as their UI

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both web and mobile
5. Submit a pull request

## License

Private project - All rights reserved.