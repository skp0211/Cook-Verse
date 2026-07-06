import { View, Text, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { COLORS } from "../../constants/colors";
import { ROUTES } from "../../constants/routes";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace(ROUTES.welcome), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 110,
          height: 110,
          borderRadius: 28,
          backgroundColor: COLORS.primary,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Image
          source={require("../../assets/images/icon.png")}
          style={{ width: 72, height: 72 }}
          contentFit="contain"
        />
      </View>
      <Text style={{ fontSize: 34, fontWeight: "900", color: COLORS.text }}>CookVerse</Text>
      <Text style={{ color: COLORS.textLight, marginTop: 6, fontSize: 15 }}>
        AI Recipe Social App
      </Text>
    </View>
  );
}
