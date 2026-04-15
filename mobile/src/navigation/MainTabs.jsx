import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home, History, PlusSquare, CalendarDays, Users } from "lucide-react-native";
import useRescheduleRemindersOnAppStart from "@hooks/useRescheduleRemindersOnAppStart";
import useTheme from "@hooks/useTheme";

import DashboardScreen from "@screens/DashboardScreen";
import CalendarScreen from "@screens/CalendarScreen";
import AddJobScreen from "@screens/AddJobScreen";
import JobHistoryScreen from "@screens/JobHistoryScreen";
import ProfileScreen from "@screens/ProfileScreen";
import CustomerSearchScreen from "@screens/CustomerSearchScreen";
import CustomerDetailsScreen from "@screens/CustomerDetailsScreen";
import CustomerListScreen from "@screens/CustomerListScreen";
import JobDetailsScreen from "@screens/JobDetailsScreen";
import InvoicePreviewScreen from "@screens/InvoicePreviewScreen";
import RemindersScreen from "@screens/RemindersScreen";
import CreateCustomerScreen from "@screens/CreateCustomerScreen";
import DraftsListScreen from "@screens/DraftsListScreen";
import SetupProfileScreen from "@screens/SetupProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 24,
          paddingTop: 12,
          height: 90,
          shadowColor: colors.tabShadow,
          shadowOpacity: 0.15,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: -10 },
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter",
          fontSize: 9,
          fontWeight: "600",
          letterSpacing: 1,
          textTransform: "none",
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          if (route.name === "Dashboard") IconComponent = Home;
          else if (route.name === "JobHistory") IconComponent = History;
          else if (route.name === "Customers") IconComponent = Users;
          else if (route.name === "AddJob") IconComponent = PlusSquare;
          else if (route.name === "Calendar") IconComponent = CalendarDays;

          return (
            <IconComponent
              color={color}
              size={20}
              strokeWidth={focused ? 2.5 : 2}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="JobHistory"
        component={JobHistoryScreen}
        options={{ tabBarLabel: "History" }}
      />
      <Tab.Screen
        name="AddJob"
        component={AddJobScreen}
        options={{ tabBarLabel: "Add Job" }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: "Calendar" }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomerListScreen}
        options={{ tabBarLabel: "Customers" }}
      />
    </Tab.Navigator>
  );
}

export default function MainTabs() {
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
      <Stack.Screen name="CreateCustomer" component={CreateCustomerScreen} />
      <Stack.Screen name="SetupProfile" component={SetupProfileScreen} />
    </Stack.Navigator>
  );
}
