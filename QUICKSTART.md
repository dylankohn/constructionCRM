# Quick Start Guide - Construction CRM Mobile App

## Prerequisites Checklist

- [ ] Node.js (v16+) installed
- [ ] Backend database configured
- [ ] Expo CLI installed globally (`npm install -g expo-cli`)

## Setup Steps

### 1. Start the Backend (Terminal 1)

```bash
# From project root
node server.js
```

You should see: `Server running on port 3000`

### 2. Install Mobile Dependencies (Terminal 2)

```bash
cd mobile-app
npm install
```

### 3. Configure for Your Device

**For Emulator/Simulator:**
- No changes needed! The default `localhost` will work.

**For Physical Device:**
- Find your computer's IP address:
  - Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
  - Windows: `ipconfig` (look for IPv4)
  
- Edit `mobile-app/app.json`:
  ```json
  "extra": {
    "apiUrl": "http://YOUR_IP:3000"
  }
  ```
  Example: `"apiUrl": "http://192.168.1.100:3000"`

### 4. Start the Mobile App (Terminal 2)

```bash
npm start
```

### 5. Run on Your Device

**Option A - iOS Simulator (Mac only):**
- Press `i` in the terminal

**Option B - Android Emulator:**
- Press `a` in the terminal

**Option C - Physical Device:**
1. Install "Expo Go" app (App Store or Google Play)
2. Make sure phone is on same Wi-Fi as computer
3. Scan the QR code shown in terminal

## First Time Setup

1. **Create Account**: Tap "Create Account" on login screen
2. **Login**: Use your new credentials
3. **Add Customer**: From dashboard, tap "+ Add" in Customer Pages
4. **Create Job**: Navigate to customer, tap "+ Add Job"
5. **Add Materials**: Open a job, tap "📦 Materials"

## Testing the Area Calculator

1. Go to Dashboard → Tools → Area Calculator
2. Grant location permissions when prompted
3. Tap "Start Drawing"
4. Tap on the map to create points (minimum 3 points)
5. Tap "Finish" when done
6. The area will be calculated automatically
7. Tap "💾 Save to Job" to associate with a job

**Note:** Google Maps API key required for Area Calculator. See MOBILE_SETUP.md for details.

## Common First-Time Issues

### "Cannot connect to backend"
✅ Check backend is running (`node server.js`)
✅ Verify API URL in `app.json`
✅ Ensure device and computer on same Wi-Fi

### "App won't start"
✅ Clear cache: `expo start -c`
✅ Delete `node_modules`, run `npm install` again

### "Maps not loading"
✅ Add Google Maps API key to `app.json`
✅ Grant location permissions

## File Structure

```
mobile-app/
├── App.js                      # Main entry point
├── app.json                    # Configuration
├── src/
│   ├── screens/                # All app screens
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── CustomerJobs.js
│   │   ├── JobDetails.js
│   │   ├── JobMaterials.js
│   │   └── AreaCalculator.js
│   ├── config/config.js        # API URL configuration
│   ├── utils/storage.js        # Data persistence
│   └── styles/colors.js        # Brand colors
```

## What's Shared Between Web & Mobile?

✅ **Shared (used by both):**
- Backend (`server.js`)
- Database
- All API endpoints
- Business logic

📱 **Mobile-specific:**
- React Native components
- Mobile navigation
- Touch interactions
- Native device features

## Next Steps

1. Explore all features in the app
2. Test on both iOS and Android
3. Customize colors in `src/styles/colors.js`
4. Add your logo to `assets/` folder
5. Configure Google Maps for Area Calculator

## Need Help?

- Check `MOBILE_SETUP.md` for detailed setup
- See `mobile-app/README.md` for full documentation
- Backend issues: Check `server.js` console logs
- Mobile issues: Check Expo Developer Tools logs

## Development Tips

- **Fast Refresh**: Changes appear instantly while editing
- **Debug Menu**: Shake device or Cmd+D (iOS) / Cmd+M (Android)
- **Reload**: Double-tap R in terminal or use debug menu
- **Clear Cache**: `expo start -c` if something seems stuck

Enjoy your Construction CRM mobile app! 🚀📱

