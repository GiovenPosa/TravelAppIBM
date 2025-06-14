import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import SignupDetailsScreen from './screens/SignupDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import ChatScreen from './screens/ChatScreen';
import ControlPanelScreen from './screens/ControlPanelScreen';
import BookingsScreen from './screens/BookingsScreen';
import CreateThreadScreen from './screens/CreateThreadScreen';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainAppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name="home" size={size} color={color} />;
          } else if (route.name === 'Search') {
            return <Ionicons name="search" size={size} color={color} />;
          } else if (route.name === 'Control Panel') {
            return <MaterialIcons name="settings" size={size} color={color} />;
          } else if (route.name === 'Bookings') {
            return <FontAwesome name="calendar-check-o" size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <Ionicons name="person" size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name='Search' component={SearchScreen} />
      <Tab.Screen name='Control Panel' component={ControlPanelScreen} />
      <Tab.Screen name='Bookings' component={BookingsScreen} />
      <Tab.Screen name='Profile' component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Signup">
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="SignupDetails" component={SignupDetailsScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainAppTabs} options={{ headerShown: false }}/>
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="CreateThread" component={CreateThreadScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}