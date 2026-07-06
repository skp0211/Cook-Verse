import { Redirect, Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { COLORS } from "../../constants/colors";
import { ROUTES } from "../../constants/routes";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href={ROUTES.tabs} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
