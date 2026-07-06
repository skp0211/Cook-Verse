import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { CookVerseAPI } from "../../services/cookverseAPI";
import { cvStyles } from "../../assets/styles/cookverse.styles";
import { ALL_CATEGORIES, DIET_TYPES } from "../../constants/categories";
import { COLORS } from "../../constants/colors";
import LoadingSpinner from "../../components/LoadingSpinner";
import { normalizeIngredients, normalizeSteps } from "../../utils/recipeHelpers";

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES[0]);
  const [dietType, setDietType] = useState(DIET_TYPES[0]);

  useEffect(() => {
    CookVerseAPI.getRecipe(id)
      .then((recipe) => {
        if (recipe.createdBy !== user?.id) {
          Alert.alert("Error", "You can only edit your own recipes");
          router.back();
          return;
        }
        setTitle(recipe.title || "");
        setImage(recipe.image);
        setCategory(recipe.category || ALL_CATEGORIES[0]);
        setDietType(recipe.dietType || DIET_TYPES[0]);

        const ingredients = normalizeIngredients(recipe.ingredients);
        setIngredientsText(
          ingredients
            .map((ing) => (typeof ing === "string" ? ing : `${ing.quantity || ""} ${ing.name || ""}`.trim()))
            .join("\n")
        );

        const steps = normalizeSteps(recipe.steps);
        setStepsText(steps.join("\n"));
      })
      .catch((e) => Alert.alert("Error", e.message))
      .finally(() => setLoading(false));
  }, [id, user?.id]);

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

  const handleSave = async () => {
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

    setSaving(true);
    try {
      await CookVerseAPI.updateRecipe(id, {
        userId: user.id,
        title: title.trim(),
        image,
        ingredients,
        steps,
        category,
        dietType,
      });
      Alert.alert("Saved!", "Your recipe has been updated.");
      router.back();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading recipe..." />;

  return (
    <ScrollView style={cvStyles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={cvStyles.headerTitle}>Edit Recipe</Text>
      </View>

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
            <Text style={{ color: COLORS.textLight, marginTop: 8 }}>Tap to change photo</Text>
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
        placeholderTextColor={COLORS.textLight}
        multiline
        value={ingredientsText}
        onChangeText={setIngredientsText}
      />

      <Text style={{ color: COLORS.text, fontWeight: "600", marginBottom: 6 }}>Steps (one per line)</Text>
      <TextInput
        style={[cvStyles.input, cvStyles.textArea]}
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
        style={[cvStyles.primaryBtn, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={cvStyles.primaryBtnText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
