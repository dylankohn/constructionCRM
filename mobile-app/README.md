# Construction CRM Mobile App

React Native Expo mobile application for the Construction CRM system.

## Features

- ✅ User authentication (Login/Register)
- ✅ Customer management
- ✅ Job tracking and details
- ✅ Material management for jobs
- ✅ Area calculator with map integration
- ✅ Real-time cost tracking
- ✅ Offline-capable with AsyncStorage

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio (for Android emulator)
- Expo Go app on your physical device (optional, for testing)

## Installation

1. Navigate to the mobile app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure the API URL:
   - Open `app.json`
   - Update the `extra.apiUrl` field with your backend URL
   - For local development with a physical device, use your computer's local IP address:
     ```json
     "extra": {
       "apiUrl": "http://192.168.1.XXX:3000"
     }
     ```

4. For Google Maps (Area Calculator):
   - Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the following APIs:
     - Maps SDK for Android
     - Maps SDK for iOS
   - Add your API key to `app.json`:
     ```json
     "android": {
       "config": {
         "googleMaps": {
           "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
         }
       }
     }
     ```

## Running the App

### Start the Expo development server:
```bash
npm start
```

This will open the Expo Developer Tools in your browser.

### Run on iOS Simulator (Mac only):
```bash
npm run ios
```

### Run on Android Emulator:
```bash
npm run android
```

### Run on Physical Device:
1. Install the "Expo Go" app from the App Store or Google Play
2. Scan the QR code shown in the terminal or Expo Developer Tools
3. Make sure your device is on the same Wi-Fi network as your computer

## Backend Setup

Make sure the backend server is running before using the mobile app:

1. Navigate to the project root:
```bash
cd ..
```

2. Start the backend server:
```bash
node server.js
```

The server should be running on `http://localhost:3000` by default.

## Configuration

### Environment Variables

For production, you'll want to set the API URL as an environment variable:

1. Create a `.env` file in the mobile-app directory:
```
API_URL=https://your-backend-url.com
```

2. Update `app.json` to use the environment variable:
```json
"extra": {
  "apiUrl": process.env.API_URL || "http://localhost:3000"
}
```

## Project Structure

```
mobile-app/
├── App.js                      # Main app entry with navigation
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── src/
│   ├── config/
│   │   └── config.js          # API configuration
│   ├── screens/
│   │   ├── Login.js           # Login/Register screen
│   │   ├── Dashboard.js       # Main dashboard
│   │   ├── CustomerJobs.js    # Customer's jobs list
│   │   ├── JobDetails.js      # Job details and editing
│   │   ├── JobMaterials.js    # Materials management
│   │   └── AreaCalculator.js  # Map-based area calculator
│   ├── styles/
│   │   └── colors.js          # Shared color palette
│   └── utils/
│       └── storage.js         # AsyncStorage utilities
```

## Shared Code

The mobile app shares the following with the desktop web app:
- Backend API (`server.js`)
- Database structure
- API endpoints
- Business logic

The following are mobile-specific:
- React Native components (instead of React web components)
- React Navigation (instead of React Router)
- AsyncStorage (instead of localStorage)
- React Native Maps (instead of Google Maps Web)

## Building for Production

### iOS:
```bash
expo build:ios
```

### Android:
```bash
expo build:android
```

For more information on building for production, see the [Expo documentation](https://docs.expo.dev/distribution/building-standalone-apps/).

## Troubleshooting

### Cannot connect to backend

1. **Using a physical device**: Make sure you're using your computer's local IP address in the API URL, not `localhost`
2. **Check CORS**: The backend has been updated to allow mobile connections in development mode
3. **Firewall**: Ensure your firewall allows connections on port 3000

### Google Maps not working

1. **API Key**: Make sure you've added a valid Google Maps API key
2. **Billing**: Google Maps requires billing to be enabled (though they have a generous free tier)
3. **Permissions**: The app requests location permissions - make sure to allow them

### App crashes on startup

1. **Clear cache**: Run `expo start -c` to clear the cache
2. **Reinstall dependencies**: Delete `node_modules` and run `npm install` again
3. **Check logs**: Look at the error messages in the terminal or Expo Developer Tools

## Development Tips

1. **Fast Refresh**: Expo supports Fast Refresh - your changes will appear instantly
2. **Debug Menu**: Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android) to open the debug menu
3. **Network Inspector**: Enable network inspection in the debug menu to see API calls
4. **React DevTools**: Install and use React DevTools for component inspection

## Next Steps

- Add push notifications for job updates
- Implement photo uploads for materials/jobs
- Add offline sync capabilities
- Create native builds for App Store/Google Play
- Add biometric authentication

## License

This project is part of the Construction CRM system.

