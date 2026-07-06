import { Stack } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import SafeScreen from "@/components/SafeScreen";

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="create-profile" />
          <Stack.Screen name="recipe/[id]" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="follow-list" />
          <Stack.Screen name="about" />
          <Stack.Screen name="privacy-policy" />
          <Stack.Screen name="terms-of-service" />
          <Stack.Screen name="edit-recipe/[id]" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeScreen>
    </ClerkProvider>
  );
}
