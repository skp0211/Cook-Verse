import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CookVerseLogo from "../components/CookVerseLogo";
import { COLORS } from "../constants/colors";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About CookVerse</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <CookVerseLogo size="medium" />
        <Text style={styles.tagline}>Discover, Share & Cook Amazing Recipes</Text>

        <Text style={styles.paragraph}>
          CookVerse is your social cooking companion — browse trending recipes, follow
          talented home chefs, save your favorites, and share your own creations with a
          vibrant food-loving community.
        </Text>

        <Text style={styles.sectionHeading}>Features</Text>
        <Text style={styles.bullet}>• Personalized recipe feed tailored to your taste</Text>
        <Text style={styles.bullet}>• AI-powered recipe generation from ingredients</Text>
        <Text style={styles.bullet}>• Follow chefs and build your cooking network</Text>
        <Text style={styles.bullet}>• Save, like, and comment on recipes</Text>
        <Text style={styles.bullet}>• Upload and share your own recipes</Text>

        <Text style={styles.sectionHeading}>Contact</Text>
        <Text style={styles.paragraph}>
          Have feedback or need help? Reach us at support@cookverse.app
        </Text>

        <Text style={styles.footer}>Made with ❤️ for food lovers everywhere</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  content: { padding: 24, alignItems: "center" },
  tagline: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
    alignSelf: "flex-start",
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
    alignSelf: "flex-start",
  },
  bullet: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 28,
    alignSelf: "flex-start",
  },
  footer: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 32,
    textAlign: "center",
  },
});
