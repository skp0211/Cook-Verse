import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

const SECTIONS = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly, such as your name, email address, profile photo, and recipes you upload. We also collect usage data to improve the app experience.",
  },
  {
    title: "How We Use Your Information",
    body: "Your information is used to provide and improve CookVerse services, personalize your feed, enable social features like following and commenting, and communicate important updates.",
  },
  {
    title: "Data Sharing",
    body: "We do not sell your personal data. Public profile information and recipes you share are visible to other CookVerse users. We may share data with service providers (authentication, hosting) who help us operate the app.",
  },
  {
    title: "Data Security",
    body: "We use industry-standard security measures including encrypted connections and secure authentication to protect your data. However, no method of transmission over the internet is 100% secure.",
  },
  {
    title: "Your Rights",
    body: "You can update your profile, deactivate your account temporarily, or permanently delete your account and all associated data at any time through Settings.",
  },
  {
    title: "Cookies & Analytics",
    body: "We may use analytics tools to understand how the app is used. These tools collect anonymous usage statistics and do not identify you personally.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or via email.",
  },
  {
    title: "Contact Us",
    body: "If you have questions about this Privacy Policy, contact us at privacy@cookverse.app",
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
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
