import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser, useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { CookVerseAPI } from "../services/cookverseAPI";
import { COLORS } from "../constants/colors";
import { ROUTES } from "../constants/routes";

function SettingsRow({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={[styles.iconWrap, danger && styles.iconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? "#E53935" : COLORS.primary} />
      </View>
      <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
    </TouchableOpacity>
  );
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleDeactivate = () => {
    Alert.alert(
      "Deactivate Account",
      "Your profile and posts will be hidden temporarily. You can reactivate by signing in again. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              await CookVerseAPI.deactivateAccount(user.id);
              await signOut();
              router.replace(ROUTES.welcome);
              Alert.alert("Account Deactivated", "Your account has been temporarily deactivated.");
            } catch (e) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ]
    );
  };

  const handleDeletePermanent = () => {
    Alert.alert(
      "Delete Account Permanently",
      "This will permanently delete your profile, recipes, and all data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Are you absolutely sure?",
              "All your data will be permanently removed.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Delete",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await CookVerseAPI.deleteAccount(user.id);
                      await user.delete();
                      await signOut();
                      router.replace(ROUTES.welcome);
                    } catch (e) {
                      Alert.alert("Error", e.message || "Could not delete account");
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <SectionTitle title="Account" />
        <View style={styles.card}>
          <SettingsRow
            icon="person-outline"
            label="Edit Profile"
            onPress={() => router.push(ROUTES.profile)}
          />
          <SettingsRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={() => {
              Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign Out",
                  onPress: async () => {
                    await signOut();
                    router.replace(ROUTES.welcome);
                  },
                },
              ]);
            }}
          />
        </View>

        <SectionTitle title="About" />
        <View style={styles.card}>
          <SettingsRow
            icon="information-circle-outline"
            label="About CookVerse"
            onPress={() => router.push(ROUTES.about)}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => router.push(ROUTES.privacy)}
          />
          <SettingsRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => router.push(ROUTES.terms)}
          />
        </View>

        <SectionTitle title="Danger Zone" />
        <View style={styles.card}>
          <SettingsRow
            icon="pause-circle-outline"
            label="Deactivate Account (Temporary)"
            onPress={handleDeactivate}
            danger
          />
          <SettingsRow
            icon="trash-outline"
            label="Delete Account (Permanent)"
            onPress={handleDeletePermanent}
            danger
          />
        </View>

        <Text style={styles.version}>CookVerse v1.0.0</Text>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDanger: { backgroundColor: "#FFEBEE" },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: COLORS.text },
  dangerText: { color: "#E53935" },
  version: {
    textAlign: "center",
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: 24,
  },
});
