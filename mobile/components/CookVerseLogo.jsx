import { View, Text } from "react-native";
import { Image } from "expo-image";
import { COLORS } from "../constants/colors";

const LOGO = require("../assets/images/icon.png");

export default function CookVerseLogo({ size = "medium", showTagline = false }) {
  const sizes = {
    small: { logo: 64, font: 22, gap: 10 },
    medium: { logo: 88, font: 30, gap: 14 },
    large: { logo: 110, font: 34, gap: 16 },
  };
  const s = sizes[size] || sizes.medium;

  return (
    <View style={{ alignItems: "center", marginBottom: 8 }}>
      <View
        style={{
          width: s.logo + 20,
          height: s.logo + 20,
          borderRadius: (s.logo + 20) * 0.22,
          backgroundColor: COLORS.white,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: s.gap,
          borderWidth: 2,
          borderColor: COLORS.primary + "25",
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 14,
          elevation: 8,
        }}
      >
        <Image
          source={LOGO}
          style={{
            width: s.logo,
            height: s.logo,
            borderRadius: s.logo * 0.2,
          }}
          contentFit="cover"
        />
      </View>

      <Text
        style={{
          fontSize: s.font,
          fontWeight: "900",
          color: COLORS.text,
          letterSpacing: -0.5,
        }}
      >
        CookVerse
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: COLORS.primary,
          letterSpacing: 2.5,
          marginTop: 4,
          textTransform: "uppercase",
        }}
      >
        Recipe Social
      </Text>

      {showTagline && (
        <Text
          style={{
            fontSize: 15,
            color: COLORS.textLight,
            textAlign: "center",
            marginTop: 10,
            lineHeight: 22,
          }}
        >
          Discover · Create · Share Recipes
        </Text>
      )}
    </View>
  );
}
