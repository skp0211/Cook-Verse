import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { View, ActivityIndicator } from "react-native";
import { COLORS } from "../constants/colors";
import { ROUTES } from "../constants/routes";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isSignedIn) return <Redirect href={ROUTES.tabs} />;

  return <Redirect href={ROUTES.splash} />;
}
