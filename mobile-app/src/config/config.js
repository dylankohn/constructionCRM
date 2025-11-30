import Constants from 'expo-constants';

// Get API URL from app.json extra config or use default
export const BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://localhost:3000";

// For production, you would set this to your deployed backend URL
// export const BASE_URL = "https://your-backend-url.com";

