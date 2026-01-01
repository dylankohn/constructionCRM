import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import storage utilities
import { getUser, saveUser, removeUser } from './src/utils/storage';

// Import screens
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import CustomerJobs from './src/screens/CustomerJobs';
import JobDetails from './src/screens/JobDetails';
import JobMaterials from './src/screens/JobMaterials';
import AreaCalculator from './src/screens/AreaCalculator';

// Import colors
import { colors } from './src/styles/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await getUser();
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (err) {
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle user changes (login/logout)
  const handleSetUser = async (userData) => {
    if (userData) {
      await saveUser(userData);
      setUser(userData);
    } else {
      await removeUser();
      setUser(null);
    }
  };

  // Show loading screen while checking for saved user
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!user ? (
          // Auth Stack
          <Stack.Screen name="Login">
            {(props) => <Login {...props} setUser={handleSetUser} />}
          </Stack.Screen>
        ) : (
          // App Stack
          <>
            <Stack.Screen name="Dashboard">
              {(props) => (
                <Dashboard {...props} user={user} setUser={handleSetUser} />
              )}
            </Stack.Screen>
            <Stack.Screen name="CustomerJobs">
              {(props) => (
                <CustomerJobs {...props} user={user} setUser={handleSetUser} />
              )}
            </Stack.Screen>
            <Stack.Screen name="JobDetails">
              {(props) => (
                <JobDetails {...props} user={user} setUser={handleSetUser} />
              )}
            </Stack.Screen>
            <Stack.Screen name="JobMaterials">
              {(props) => (
                <JobMaterials {...props} user={user} setUser={handleSetUser} />
              )}
            </Stack.Screen>
            <Stack.Screen name="AreaCalculator">
              {(props) => (
                <AreaCalculator {...props} user={user} setUser={handleSetUser} />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light,
  },
});

