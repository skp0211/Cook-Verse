import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { ROUTES } from "../../constants/routes";
import CookVerseLogo from "../../components/CookVerseLogo";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        padding: 28,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 48 }}>
        <CookVerseLogo size="large" showTagline />
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: COLORS.primary,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: "center",
          marginBottom: 12,
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
        onPress={() => router.push(ROUTES.signIn)}
      >
        <Text style={{ color: COLORS.white, fontSize: 17, fontWeight: "700" }}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: "center",
          borderWidth: 2,
          borderColor: COLORS.primary,
        }}
        onPress={() => router.push(ROUTES.signUp)}
      >
        <Text style={{ color: COLORS.primary, fontSize: 17, fontWeight: "700" }}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
