import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator, Pressable, Platform } from "react-native";
import { useEffect, useState } from "react";
import { COLORS } from "../../constants/colors";
import { ROUTES } from "../../constants/routes";
import { CookVerseAPI } from "../../services/cookverseAPI";

function AITabButton({ onPress, accessibilityState }) {
  const focused = accessibilityState?.selected;
  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", paddingBottom: 4 }}
    >
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: COLORS.primary,
          alignItems: "center",
          justifyContent: "center",
          marginTop: -22,
          borderWidth: 4,
          borderColor: COLORS.white,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.28,
          shadowRadius: 10,
          elevation: 12,
          transform: [{ scale: focused ? 1.05 : 1 }],
        }}
      >
        <Ionicons name="sparkles" size={26} color={COLORS.white} />
      </View>
      <View style={{ height: 18 }} />
    </Pressable>
  );
}

const TabsLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [profileReady, setProfileReady] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      if (isSignedIn) setProfileReady(false);
      return;
    }
    CookVerseAPI.reactivateAccount(user.id).catch(() => {});
    CookVerseAPI.getUser(user.id)
      .then((p) => setProfileReady(!!p?.fullName))
      .catch((err) => {
        if (err.message?.includes("deactivated")) {
          setProfileReady(false);
        } else {
          setProfileReady(false);
        }
      });
  }, [user?.id, isSignedIn]);

  if (!isLoaded || (isSignedIn && profileReady === null)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href={ROUTES.welcome} />;

  if (!profileReady) return <Redirect href={ROUTES.createProfile} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "ios" ? 22 : 10,
          paddingTop: 6,
          height: Platform.OS === "ios" ? 88 : 72,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen
        name="generate"
        options={{
          title: "AI Chef",
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => <AITabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size + 4} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="favorites" options={{ href: null }} />
    </Tabs>
  );
};

export default TabsLayout;
