import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    body: "By using CookVerse, you agree to these Terms of Service. If you do not agree, please do not use the app.",
  },
  {
    title: "User Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating your profile.",
  },
  {
    title: "User Content",
    body: "You retain ownership of recipes and content you upload. By posting on CookVerse, you grant us a non-exclusive license to display and distribute your content within the app.",
  },
  {
    title: "Community Guidelines",
    body: "Do not post offensive, harmful, or misleading content. Do not harass other users. We reserve the right to remove content and suspend accounts that violate these guidelines.",
  },
  {
    title: "Intellectual Property",
    body: "CookVerse branding, design, and app features are protected by intellectual property laws. Do not copy or redistribute app content without permission.",
  },
  {
    title: "Limitation of Liability",
    body: "CookVerse is provided as-is. We are not liable for any damages arising from your use of the app, including reliance on recipe instructions or nutritional information.",
  },
  {
    title: "Account Termination",
    body: "You may deactivate or delete your account at any time through Settings. We may terminate accounts that violate these terms.",
  },
  {
    title: "Contact",
    body: "Questions about these terms? Email legal@cookverse.app",
  },
];

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Last updated: July 2026</Text>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
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
  content: { padding: 20, paddingBottom: 40 },
  updated: { fontSize: 13, color: COLORS.textLight, marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text, marginBottom: 6 },
  sectionBody: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
});
