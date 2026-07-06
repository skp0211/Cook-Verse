import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CookVerseAPI } from "../../services/cookverseAPI";
import { cvStyles } from "../../assets/styles/cookverse.styles";
import { COLORS } from "../../constants/colors";
import AIRecipeCard from "../../components/AIRecipeCard";

const MODES = [
  { id: "dish", label: "By Dish", icon: "restaurant" },
  { id: "ingredients", label: "By Ingredients", icon: "basket" },
];

export default function GenerateScreen() {
  const { user } = useUser();
  const params = useLocalSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState("dish");
  const [dishQuery, setDishQuery] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user?.id) {
      CookVerseAPI.getAIHistory(user.id)
        .then(setHistory)
        .catch(() => {});
    }
  }, [user?.id]);

  useEffect(() => {
    if (!params.q || typeof params.q !== "string") return;
    const q = params.q.trim();
    const looksLikeDish =
      q.includes(" ") ||
      /how to|recipe|cook|make|biryani|pasta|curry|pizza|dosa|salad/i.test(q);

    if (looksLikeDish) {
      setMode("dish");
      setDishQuery(q);
      setLoading(true);
      CookVerseAPI.generateAI({ query: q, dishName: q, userId: user?.id })
        .then(setResult)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      const items = q.split(/[,\s]+/).filter(Boolean);
      if (items.length) {
        setMode("ingredients");
        setIngredients(items);
      }
    }
  }, [params.q, user?.id]);

  const addIngredient = () => {
    const trimmed = ingredient.trim();
    if (!trimmed) return;
    if (!ingredients.includes(trimmed)) setIngredients([...ingredients, trimmed]);
    setIngredient("");
  };

  const removeIngredient = (item) => {
    setIngredients(ingredients.filter((i) => i !== item));
  };

  const handleGenerate = async () => {
    if (mode === "dish" && !dishQuery.trim()) {
      Alert.alert("Enter a dish", 'Try "How to cook biryani" or "Chicken pasta"');
      return;
    }
    if (mode === "ingredients" && !ingredients.length) {
      Alert.alert("Add ingredients", "Add at least one ingredient to generate a recipe.");
      return;
    }

    setLoading(true);
    try {
      const recipe = await CookVerseAPI.generateAI({
        query: mode === "dish" ? dishQuery.trim() : undefined,
        dishName: mode === "dish" ? dishQuery.trim() : undefined,
        ingredients: mode === "ingredients" ? ingredients : [],
        userId: user?.id,
      });
      setResult(recipe);
      if (user?.id) {
        const h = await CookVerseAPI.getAIHistory(user.id);
        setHistory(h);
      }
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to generate recipe");
    } finally {
      setLoading(false);
    }
  };

  const saveToFeed = async () => {
    if (!result || !user?.id) return;
    try {
      const saved = await CookVerseAPI.createRecipe({
        title: result.title,
        image: result.image,
        ingredients: result.ingredients,
        steps: result.steps,
        cookingTime: result.cookingTime,
        difficulty: result.difficulty,
        calories: result.calories,
        nutrition: result.nutrition,
        tips: result.tips,
        isAIGenerated: true,
        createdBy: user.id,
        creatorName: user.fullName || "CookVerse Chef",
        creatorAvatar: user.imageUrl,
        category: "AI Generated",
        dietType: "Vegetarian",
      });
      Alert.alert("Saved!", "Recipe posted to the feed.");
      router.push(`/recipe/${saved.id}?source=cookverse`);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <ScrollView style={cvStyles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Ionicons name="sparkles" size={28} color={COLORS.primary} />
        <Text style={cvStyles.headerTitle}>AI Recipe Generator</Text>
      </View>
      <Text style={{ color: COLORS.textLight, marginBottom: 16 }}>
        Ask for any dish or enter ingredients you have
      </Text>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[
              cvStyles.chip,
              { flex: 1, flexDirection: "row", justifyContent: "center", gap: 6, paddingVertical: 12 },
              mode === m.id && cvStyles.chipActive,
            ]}
            onPress={() => setMode(m.id)}
          >
            <Ionicons
              name={m.icon}
              size={16}
              color={mode === m.id ? COLORS.white : COLORS.text}
            />
            <Text style={[cvStyles.chipText, mode === m.id && cvStyles.chipTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === "dish" ? (
        <View style={{ marginBottom: 16 }}>
          <TextInput
            style={cvStyles.input}
            placeholder='e.g. "How to cook biryani"'
            placeholderTextColor={COLORS.textLight}
            value={dishQuery}
            onChangeText={setDishQuery}
            multiline
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {["Biryani", "Pasta", "Paneer Tikka", "Dosa"].map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={cvStyles.chip}
                onPress={() => setDishQuery(`How to cook ${suggestion.toLowerCase()}`)}
              >
                <Text style={cvStyles.chipText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <TextInput
              style={[cvStyles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="e.g. Egg, Rice, Onion..."
              placeholderTextColor={COLORS.textLight}
              value={ingredient}
              onChangeText={setIngredient}
              onSubmitEditing={addIngredient}
            />
            <TouchableOpacity
              style={[cvStyles.primaryBtn, { paddingHorizontal: 16, marginTop: 0 }]}
              onPress={addIngredient}
            >
              <Ionicons name="add" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {ingredients.map((item) => (
              <TouchableOpacity key={item} style={cvStyles.chip} onPress={() => removeIngredient(item)}>
                <Text style={cvStyles.chipText}>
                  {item} <Ionicons name="close" size={12} />
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity
        style={[cvStyles.primaryBtn, loading && { opacity: 0.7 }]}
        onPress={() => handleGenerate()}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={cvStyles.primaryBtnText}>✨ Generate Recipe with Image</Text>
        )}
      </TouchableOpacity>

      {result && <AIRecipeCard recipe={result} onShare={user?.id ? saveToFeed : undefined} />}

      {history.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={cvStyles.sectionTitle}>Previous Generations</Text>
          {history.map((h) => (
            <TouchableOpacity
              key={h.id}
              style={[cvStyles.card, { padding: 12, marginBottom: 8 }]}
              onPress={() => setResult(h.recipe)}
            >
              <Text style={{ fontWeight: "700", color: COLORS.text }}>{h.recipe.title}</Text>
              <Text style={{ color: COLORS.textLight, fontSize: 12 }}>
                {new Date(h.createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
