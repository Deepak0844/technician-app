import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home, History, PlusSquare, CalendarDays, User, Users } from "lucide-react-native";
import useRescheduleRemindersOnAppStart from "../hooks/useRescheduleRemindersOnAppStart";

import DashboardScreen from "../screens/DashboardScreen";
import CalendarScreen from "../screens/CalendarScreen";
import AddJobScreen from "../screens/AddJobScreen";
import JobHistoryScreen from "../screens/JobHistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CustomerSearchScreen from "../screens/CustomerSearchScreen";
import CustomerDetailsScreen from "../screens/CustomerDetailsScreen";
import CustomerListScreen from "../screens/CustomerListScreen";
import JobDetailsScreen from "../screens/JobDetailsScreen";
import InvoicePreviewScreen from "../screens/InvoicePreviewScreen";
import RemindersScreen from "../screens/RemindersScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#81ecff",
        tabBarInactiveTintColor: "#a3a3a3",
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: "rgba(0,0,0,0.9)",
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.05)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 24,
          paddingTop: 12,
          height: 90,
          shadowColor: '#8f00ff',
          shadowOpacity: 0.15,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: -10 },
          elevation: 10,
        },
        tabBarLabelStyle: { 
          fontFamily: 'Inter',
          fontSize: 9, 
          fontWeight: "600", 
          letterSpacing: 1,
          textTransform: 'none',
          marginTop: 4
        },
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          if (route.name === 'Dashboard') IconComponent = Home;
          else if (route.name === 'JobHistory') IconComponent = History;
          else if (route.name === 'Customers') IconComponent = Users;
          else if (route.name === 'AddJob') IconComponent = PlusSquare;
          else if (route.name === 'Calendar') IconComponent = CalendarDays;
          else if (route.name === 'Profile') IconComponent = User;
          
          return <IconComponent color={color} size={20} strokeWidth={focused ? 2.5 : 2} />;
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="JobHistory" component={JobHistoryScreen} options={{ tabBarLabel: "History" }} />
      <Tab.Screen name="AddJob" component={AddJobScreen} options={{ tabBarLabel: "Add Job" }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: "Calendar" }} />
      <Tab.Screen name="Customers" component={CustomerListScreen} options={{ tabBarLabel: "Customers" }} />
    </Tab.Navigator>
  );
}

export default function MainTabs() {
  // Reschedule reminders on every app open to recover from Android reboot
  useRescheduleRemindersOnAppStart();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="CustomerSearch" component={CustomerSearchScreen} />
      <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="AddJob" component={AddJobScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="InvoicePreview" component={InvoicePreviewScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
    </Stack.Navigator>
  );
}
