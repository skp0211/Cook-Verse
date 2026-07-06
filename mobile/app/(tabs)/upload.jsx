import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { CookVerseAPI } from "../../services/cookverseAPI";
import { cvStyles } from "../../assets/styles/cookverse.styles";
import { ALL_CATEGORIES, DIET_TYPES } from "../../constants/categories";
import { COLORS } from "../../constants/colors";

export default function UploadScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES[0]);
  const [dietType, setDietType] = useState(DIET_TYPES[0]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !ingredientsText.trim() || !stepsText.trim()) {
      Alert.alert("Missing fields", "Please fill title, ingredients, and steps.");
      return;
    }

    const ingredients = ingredientsText
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [quantity, ...rest] = line.split(" ");
        return { name: rest.join(" ") || line, quantity: rest.length ? quantity : "as needed" };
      });

    const steps = stepsText.split("\n").filter(Boolean);

    setLoading(true);
    try {
      const recipe = await CookVerseAPI.createRecipe({
        title: title.trim(),
        image: image || "https://source.unsplash.com/800x600/?homemade,food",
        ingredients,
        steps,
        category,
        dietType,
        cookingTime: "30 mins",
        difficulty: "Medium",
        calories: 300,
        nutrition: { protein: "15g", carbs: "30g", fat: "10g" },
        createdBy: user.id,
        creatorName: user.fullName || "CookVerse Chef",
        creatorAvatar: user.imageUrl,
      });
      Alert.alert("Uploaded!", "Your recipe is live on the feed.");
      router.push(`/recipe/${recipe.id}?source=cookverse`);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={cvStyles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={cvStyles.headerTitle}>Upload Recipe</Text>

      <TouchableOpacity onPress={pickImage} style={{ marginBottom: 16 }}>
        {image ? (
          <Image source={{ uri: image }} style={{ width: "100%", height: 200, borderRadius: 16 }} />
        ) : (
          <View
            style={{
              height: 160,
              borderRadius: 16,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: COLORS.border,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.white,
            }}
          >
            <Ionicons name="camera" size={40} color={COLORS.textLight} />
            <Text style={{ color: COLORS.textLight, marginTop: 8 }}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={cvStyles.input}
        placeholder="Recipe Title"
        placeholderTextColor={COLORS.textLight}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={{ color: COLORS.text, fontWeight: "600", marginBottom: 6 }}>Ingredients (one per line)</Text>
      <TextInput
        style={[cvStyles.input, cvStyles.textArea]}
        placeholder={"200g Paneer\n1 cup Rice\n2 tbsp Oil"}
        placeholderTextColor={COLORS.textLight}
        multiline
        value={ingredientsText}
        onChangeText={setIngredientsText}
      />

      <Text style={{ color: COLORS.text, fontWeight: "600", marginBottom: 6 }}>Steps (one per line)</Text>
      <TextInput
        style={[cvStyles.input, cvStyles.textArea]}
        placeholder={"1. Boil chickpeas...\n2. Cook with spices...\n3. Serve hot"}
        placeholderTextColor={COLORS.textLight}
        multiline
        value={stepsText}
        onChangeText={setStepsText}
      />

      <Text style={{ color: COLORS.text, fontWeight: "600", marginBottom: 8 }}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {ALL_CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[cvStyles.chip, category === c && cvStyles.chipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[cvStyles.chipText, category === c && cvStyles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={{ color: COLORS.text, fontWeight: "600", marginBottom: 8 }}>Diet Type</Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {DIET_TYPES.map((d) => (
          <TouchableOpacity
            key={d}
            style={[cvStyles.chip, dietType === d && cvStyles.chipActive]}
            onPress={() => setDietType(d)}
          >
            <Text style={[cvStyles.chipText, dietType === d && cvStyles.chipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[cvStyles.primaryBtn, loading && { opacity: 0.7 }]}
        onPress={handleUpload}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={cvStyles.primaryBtnText}>Upload Recipe</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
