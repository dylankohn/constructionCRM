# Construction CRM - Project Structure

## Overview

This project now includes both **web** and **mobile** applications sharing the same backend.

## Directory Structure

```
constructionCRMMobile/
│
├── 📱 MOBILE APP
│   └── mobile-app/
│       ├── App.js                          # Main app with navigation
│       ├── app.json                        # Expo configuration
│       ├── package.json                    # Mobile dependencies
│       ├── assets/                         # App icons and splash screens
│       └── src/
│           ├── screens/                    # React Native screens
│           │   ├── Login.js
│           │   ├── Dashboard.js
│           │   ├── CustomerJobs.js
│           │   ├── JobDetails.js
│           │   ├── JobMaterials.js
│           │   └── AreaCalculator.js
│           ├── config/
│           │   └── config.js              # API URL configuration
│           ├── utils/
│           │   └── storage.js             # AsyncStorage utilities
│           └── styles/
│               └── colors.js              # Shared color palette
│
├── 🌐 WEB APP
│   └── inventory-frontend/
│       ├── package.json                    # Web dependencies
│       ├── public/                         # Static assets
│       └── src/
│           ├── App.js                      # Web app with routing
│           ├── config.js                   # API configuration
│           ├── components/                 # React components
│           │   ├── Login.js
│           │   ├── Dashboard.js
│           │   ├── CustomerJobs.js
│           │   ├── JobDetails.js
│           │   └── JobMaterials.js
│           └── tools/
│               └── AreaCalculator.js
│
├── 🔧 BACKEND (Shared)
│   ├── server.js                           # Express API server
│   ├── package.json                        # Backend dependencies
│   └── .env                                # Database credentials
│
└── 📚 DOCUMENTATION
    ├── README.md                           # Main project README
    ├── QUICKSTART.md                       # Quick setup guide
    ├── MOBILE_SETUP.md                     # Detailed mobile setup
    ├── PROJECT_STRUCTURE.md                # This file
    └── create_areas_table.sql              # Database schema
```

## Technology Stack

### Backend (Shared)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: Custom (username/password)
- **CORS**: Configured for both web and mobile

### Web App
- **Framework**: React 19.2
- **Routing**: React Router DOM 7.9
- **Styling**: Inline styles / CSS
- **Maps**: Google Maps JavaScript API
- **Storage**: localStorage
- **Build Tool**: Create React App

### Mobile App
- **Framework**: React Native (via Expo)
- **Platform**: iOS & Android
- **Navigation**: React Navigation 6
- **Styling**: React Native StyleSheet
- **Maps**: react-native-maps
- **Storage**: AsyncStorage
- **Location**: expo-location

## API Endpoints (Shared)

All endpoints are used by both web and mobile apps:

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - User login

### Customers
- `GET /customers/:userId` - Get all customers
- `POST /customers` - Add customer
- `DELETE /customers/:id/:userId` - Delete customer

### Jobs
- `GET /jobs/customer/:customerId/:userId` - Get customer jobs
- `GET /jobs/:jobId/:userId` - Get job details
- `POST /jobs` - Create job
- `PUT /jobs/:id/:userId` - Update job
- `DELETE /jobs/:id/:userId` - Delete job

### Materials
- `GET /materials/job/:jobId/:userId` - Get job materials
- `POST /materials` - Add material
- `PUT /materials/:id/:userId` - Update material
- `DELETE /materials/:id/:userId/:jobId` - Delete material

### Areas (Calculator)
- `GET /areas/user/:userId` - Get all user areas
- `GET /areas/job/:jobId/:userId` - Get job areas
- `POST /areas` - Save calculated area
- `DELETE /areas/:id/:userId` - Delete area

## Data Flow

```
┌─────────────┐         ┌─────────────┐         ┌──────────┐
│  Web App    │         │   Backend   │         │  MySQL   │
│  (React)    │────────▶│  (Express)  │────────▶│ Database │
└─────────────┘         └─────────────┘         └──────────┘
                              ▲
                              │
                              │
┌─────────────┐               │
│ Mobile App  │               │
│ (React      │───────────────┘
│  Native)    │
└─────────────┘
```

## Key Features

### Implemented Features

✅ **User Management**
- Registration and login
- Session persistence
- Multi-user support

✅ **Customer Management**
- Add/view/delete customers
- Customer-specific job lists

✅ **Job Management**
- Create and track jobs
- Edit job details (status, dates, budget, etc.)
- View job financial summary
- Delete jobs

✅ **Material Management**
- Add materials to jobs
- Track quantities, costs, and status
- Real-time cost calculations
- Material status tracking (needed → ordered → in transit → delivered → installed)
- Automatic job cost updates

✅ **Area Calculator**
- Interactive map with drawing tools
- Calculate areas (polygon, rectangle, circle)
- Multiple unit support (sq ft, sq m, acres, hectares)
- Save areas to jobs
- View saved areas on job details

### Platform-Specific Features

**Web Only:**
- Desktop-optimized layout
- Hover effects
- Multiple mouse-based drawing shapes

**Mobile Only:**
- Touch-optimized UI
- Native navigation gestures
- Offline data persistence
- Location services integration
- Tap-to-draw on map

## Configuration Files

### Mobile App Configuration (`mobile-app/app.json`)
```json
{
  "expo": {
    "name": "Construction CRM",
    "slug": "construction-crm-mobile",
    "extra": {
      "apiUrl": "http://localhost:3000"  // Configure for your setup
    }
  }
}
```

### Web App Configuration (`inventory-frontend/src/config.js`)
```javascript
export const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
```

### Backend Configuration (`server.js`)
```javascript
// CORS configured to allow both web and mobile
// Development: allows all origins
// Production: restricts to specific domains
```

## Database Schema

Tables:
- `users` - User accounts
- `customers` - Customer information
- `jobs` - Job tracking
- `job_materials` - Materials per job
- `job_areas` - Calculated areas per job
- `inventory` - Global inventory (legacy)

## Development Workflow

### Running Everything Locally

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

### Making Changes

**Add a new feature to both apps:**
1. Add backend endpoint to `server.js`
2. Add web component to `inventory-frontend/src/components/`
3. Add mobile screen to `mobile-app/src/screens/`
4. Test on both platforms

**Update styling:**
- Web: Modify inline styles or CSS
- Mobile: Update `mobile-app/src/styles/colors.js` or component styles

## Deployment

### Backend
- Deploy to any Node.js hosting (Heroku, DigitalOcean, AWS, etc.)
- Update environment variables for production database
- Configure CORS for production domains

### Web App
- Build: `npm run build` in `inventory-frontend/`
- Deploy build folder to static hosting (Netlify, Vercel, etc.)
- Set `REACT_APP_API_URL` to production backend URL

### Mobile App
- Build standalone apps: `expo build:ios` or `expo build:android`
- Submit to App Store / Google Play
- Update API URL in `app.json` for production

## Future Enhancements

### Potential Features
- [ ] Push notifications
- [ ] Photo uploads for jobs/materials
- [ ] Offline sync
- [ ] Real-time updates
- [ ] Team collaboration
- [ ] Document management
- [ ] Invoice generation
- [ ] Calendar integration
- [ ] Barcode scanning
- [ ] Biometric authentication

### Technical Improvements
- [ ] TypeScript migration
- [ ] State management (Redux/MobX)
- [ ] Automated testing
- [ ] CI/CD pipeline
- [ ] API documentation
- [ ] Error tracking (Sentry)
- [ ] Analytics integration

## Notes

- Both apps use the same authentication system
- Data is immediately available across platforms
- Backend changes automatically benefit both apps
- Mobile app can work offline (with AsyncStorage)
- Web app requires internet connection
- Google Maps API key required for Area Calculator on both platforms

## Support

For detailed setup instructions:
- Mobile: See `MOBILE_SETUP.md`
- Quick start: See `QUICKSTART.md`
- Web: See `inventory-frontend/README.md` (if exists)

