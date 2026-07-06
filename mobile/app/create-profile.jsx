import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { CookVerseAPI } from "../services/cookverseAPI";
import { authStyles } from "../assets/styles/auth.styles";
import { cvStyles } from "../assets/styles/cookverse.styles";
import { FOOD_PREFERENCES, DIET_GOALS } from "../constants/categories";
import { COLORS } from "../constants/colors";
import LoadingSpinner from "../components/LoadingSpinner";
import { ROUTES } from "../constants/routes";

export default function CreateProfileScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [age, setAge] = useState("");
  const [foodPreference, setFoodPreference] = useState(FOOD_PREFERENCES[0]);
  const [dietGoal, setDietGoal] = useState(DIET_GOALS[0]);
  const [avatar, setAvatar] = useState(user?.imageUrl || null);
  const [loading, setLoading] = useState(false);

  if (!isLoaded) return <LoadingSpinner message="Loading..." />;
  if (!isSignedIn) return <Redirect href={ROUTES.welcome} />;

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAvatar(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
    }
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }
    setLoading(true);
    try {
      await CookVerseAPI.createProfile({
        id: user.id,
        fullName: fullName.trim(),
        age: age ? parseInt(age, 10) : null,
        foodPreference,
        dietGoal,
        bio: `${foodPreference} · ${dietGoal}`,
        avatarUrl: avatar,
      });
      router.replace(ROUTES.tabs);
    } catch (e) {
      Alert.alert("Error", e.message || "Could not save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={authStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <Text style={authStyles.title}>Create Profile</Text>
        <Text style={authStyles.subtitle}>Set up your CookVerse identity</Text>

        <TouchableOpacity onPress={pickAvatar} style={{ alignSelf: "center", marginBottom: 20 }}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width: 96, height: 96, borderRadius: 48 }} />
          ) : (
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: COLORS.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="camera" size={32} color={COLORS.textLight} />
            </View>
          )}
          <Text style={{ textAlign: "center", color: COLORS.primary, marginTop: 8, fontWeight: "600" }}>
            Add Photo
          </Text>
        </TouchableOpacity>

        <TextInput
          style={cvStyles.input}
          placeholder="Name"
          placeholderTextColor={COLORS.textLight}
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={cvStyles.input}
          placeholder="Age"
          placeholderTextColor={COLORS.textLight}
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
        />

        <Text style={{ fontWeight: "600", color: COLORS.text, marginBottom: 8 }}>Food Preference</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {FOOD_PREFERENCES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[cvStyles.chip, foodPreference === p && cvStyles.chipActive]}
              onPress={() => setFoodPreference(p)}
            >
              <Text style={[cvStyles.chipText, foodPreference === p && cvStyles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontWeight: "600", color: COLORS.text, marginBottom: 8 }}>Diet Type / Goal</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {DIET_GOALS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[cvStyles.chip, dietGoal === g && cvStyles.chipActive]}
              onPress={() => setDietGoal(g)}
            >
              <Text style={[cvStyles.chipText, dietGoal === g && cvStyles.chipTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={authStyles.buttonText}>{loading ? "Saving..." : "Next →"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
