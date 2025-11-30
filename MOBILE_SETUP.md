# Mobile App Setup Guide

This guide will help you set up and run the React Native Expo mobile app alongside the existing web application.

## Overview

The project now has both a **web app** (`inventory-frontend/`) and a **mobile app** (`mobile-app/`). They share the same backend (`server.js`) and database.

## Architecture

```
constructionCRMMobile/
├── server.js                    # Shared backend (Express + MySQL)
├── inventory-frontend/          # Web app (React)
├── mobile-app/                  # Mobile app (React Native Expo)
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   └── src/
│       ├── screens/             # Mobile screens
│       ├── config/              # Configuration
│       ├── styles/              # Shared styles
│       └── utils/               # Utilities
└── package.json                 # Root dependencies
```

## Quick Start

### 1. Install Mobile App Dependencies

```bash
cd mobile-app
npm install
```

### 2. Configure API URL

The mobile app needs to know where your backend is running.

**For iOS Simulator or Android Emulator:**
- The default `http://localhost:3000` will work

**For Physical Device:**
- Find your computer's local IP address:
  - Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
  - Windows: `ipconfig` (look for IPv4 Address)
  - Linux: `ip addr show`
  
- Update `mobile-app/app.json`:
  ```json
  "extra": {
    "apiUrl": "http://192.168.1.XXX:3000"
  }
  ```
  Replace `192.168.1.XXX` with your computer's IP address

### 3. Start the Backend

From the project root:
```bash
node server.js
```

### 4. Start the Mobile App

In a new terminal, from the `mobile-app/` directory:
```bash
npm start
```

This opens the Expo Developer Tools. From here you can:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your physical device

## Google Maps Setup (for Area Calculator)

The Area Calculator uses Google Maps, which requires an API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
4. Create credentials (API Key)
5. Add the API key to `mobile-app/app.json`:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_API_KEY_HERE"
       }
     }
   }
   ```

**Note**: Google Maps requires billing to be enabled, but they offer $200 free credit per month.

## Running Both Apps Simultaneously

You can run both the web and mobile apps at the same time:

**Terminal 1 - Backend:**
```bash
node server.js
```

**Terminal 2 - Web App:**
```bash
cd inventory-frontend
npm start
```

**Terminal 3 - Mobile App:**
```bash
cd mobile-app
npm start
```

## Key Differences: Web vs Mobile

| Feature | Web App | Mobile App |
|---------|---------|------------|
| **Framework** | React | React Native |
| **Navigation** | React Router | React Navigation |
| **Storage** | localStorage | AsyncStorage |
| **Styling** | CSS | StyleSheet (React Native) |
| **Maps** | Google Maps JS | react-native-maps |
| **UI Components** | HTML elements | React Native components |

## Common Issues & Solutions

### "Cannot connect to server"

**Problem**: Mobile app can't reach the backend

**Solutions**:
1. Check that backend is running (`node server.js`)
2. Verify API URL is correct in `app.json`
3. Ensure your device and computer are on the same Wi-Fi network
4. Check firewall settings allow connections on port 3000
5. The backend CORS has been updated to allow mobile connections in development

### "Maps not loading"

**Problem**: Area Calculator shows blank map

**Solutions**:
1. Add Google Maps API key to `app.json`
2. Enable billing in Google Cloud Console
3. Enable required APIs (Maps SDK for Android/iOS)
4. Grant location permissions when prompted

### "Expo Go app crashes"

**Problem**: App crashes immediately on physical device

**Solutions**:
1. Make sure you're using the latest version of Expo Go
2. Clear Expo cache: `expo start -c`
3. Check for JavaScript errors in the terminal
4. Try running on a simulator first to see detailed errors

### "Dependencies won't install"

**Problem**: `npm install` fails in mobile-app

**Solutions**:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Make sure you have Node.js v16 or higher
4. Try using `npm install --legacy-peer-deps` if there are peer dependency conflicts

## Testing on Devices

### iOS (Requires Mac)

**Simulator:**
```bash
cd mobile-app
npm run ios
```

**Physical Device:**
1. Install "Expo Go" from App Store
2. Make sure device is on same Wi-Fi as computer
3. Scan QR code from Expo Developer Tools

### Android

**Emulator:**
1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Run:
```bash
cd mobile-app
npm run android
```

**Physical Device:**
1. Install "Expo Go" from Google Play
2. Make sure device is on same Wi-Fi as computer
3. Scan QR code from Expo Developer Tools

## Production Deployment

### Building Standalone Apps

For iOS:
```bash
cd mobile-app
expo build:ios
```

For Android:
```bash
cd mobile-app
expo build:android
```

### Backend Configuration

For production, update:
1. `app.json` - Set production API URL
2. `server.js` - Configure proper CORS for production domains
3. Database - Use production database credentials

## Features Implemented

✅ **All desktop features available on mobile:**
- User authentication (Login/Register)
- Customer management
- Job tracking and details
- Material management
- Area calculator with map drawing
- Real-time cost calculations
- Status tracking for materials
- Job financial information

✅ **Mobile-optimized:**
- Touch-friendly UI
- Responsive layouts
- Native navigation
- Offline data persistence
- Mobile map interactions

## Next Steps

Consider adding:
- Push notifications for job updates
- Camera integration for job photos
- Biometric authentication
- Offline sync capabilities
- Dark mode support

## Support

If you encounter issues:
1. Check the terminal for error messages
2. Look at the Expo Developer Tools logs
3. Verify backend is running and accessible
4. Check that all environment variables are set correctly

For more help:
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation Documentation](https://reactnavigation.org/)

