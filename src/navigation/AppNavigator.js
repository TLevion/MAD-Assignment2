import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import CartScreen from '../screens/CartScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProductScreen from '../screens/ProductScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SearchScreen from '../screens/SearchScreen';
import StoreScreen from '../screens/StoreScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs({ user, setUser }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        tabBarStyle: { backgroundColor: '#000', borderTopColor: '#111' },
        tabBarActiveTintColor: '#05f',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ color }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = 'home'; break;
            case 'Search': iconName = 'search'; break;
            case 'Cart': iconName = 'cart'; break;
            case 'Store': iconName = 'storefront'; break;
            case 'Profile': iconName = 'person'; break;
            default: iconName = 'home';
          }
          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />

      {/* Only render Store tab if user is seller */}
      {user?.role === 'seller' && (
        <Tab.Screen name="Store" component={StoreScreen} options={{ title: 'My Store' }} />
      )}

      <Tab.Screen name="Profile" options={{ title: 'Profile' }}>
        {() => <ProfileScreen setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from AsyncStorage on app start
  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return null; // Optionally, show a splash/loading screen
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
      initialRouteName={user ? "Main" : "Login"}
    >
      {/* Auth Screens */}
      {!user && (
        <>
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {props => <LoginScreen {...props} setUser={setUser} />}
          </Stack.Screen>
          <Stack.Screen name="Register" options={{ title: 'Register' }}>
            {props => <RegisterScreen {...props} setUser={setUser} />}
          </Stack.Screen>
        </>
      )}

      {/* Main App Screens */}
      {user && (
        <>
          <Stack.Screen name="Main" options={{ headerShown: false }}>
            {() => <Tabs user={user} setUser={setUser} />}
          </Stack.Screen>
          <Stack.Screen name="Product" component={ProductScreen} options={{ title: 'Product Details' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
