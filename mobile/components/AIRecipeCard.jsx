import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cvStyles } from "../assets/styles/cookverse.styles";
import { COLORS } from "../constants/colors";
import { normalizeIngredients, normalizeSteps } from "../utils/recipeHelpers";

export default function AIRecipeCard({ recipe, onShare, compact = false }) {
  if (!recipe) return null;

  const ingredients = normalizeIngredients(recipe.ingredients);
  const steps = normalizeSteps(recipe.steps);
  const showIngredients = compact ? ingredients.slice(0, 6) : ingredients;
  const showSteps = compact ? steps.slice(0, 5) : steps;

  return (
    <View style={[cvStyles.card, { marginTop: compact ? 0 : 16, overflow: "hidden", padding: 0 }]}>
      <View
        style={{
          backgroundColor: COLORS.primary + "15",
          paddingHorizontal: 12,
          paddingVertical: 6,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Ionicons name="sparkles" size={16} color={COLORS.primary} />
        <Text style={{ color: COLORS.primary, fontWeight: "700", fontSize: 12 }}>
          AI Generated Recipe
        </Text>
      </View>

      <Image
        source={{ uri: recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" }}
        style={{ width: "100%", height: compact ? 180 : 220 }}
        contentFit="cover"
      />

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: compact ? 20 : 24, fontWeight: "800", color: COLORS.text }}>
          {recipe.title}
        </Text>
        <Text style={{ color: COLORS.textLight, marginTop: 6 }}>
          {recipe.cookingTime} · {recipe.difficulty} · {recipe.calories} cal
        </Text>

        {recipe.nutrition && (
          <Text style={{ color: COLORS.primary, marginTop: 8, fontWeight: "600", fontSize: 13 }}>
            Protein {recipe.nutrition.protein} · Carbs {recipe.nutrition.carbs} · Fat{" "}
            {recipe.nutrition.fat}
          </Text>
        )}

        <Text style={[cvStyles.sectionTitle, { marginTop: 16 }]}>Ingredients</Text>
        {showIngredients.map((ing, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 8,
              backgroundColor: COLORS.background,
              padding: 10,
              borderRadius: 10,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.primary,
                marginTop: 6,
                marginRight: 10,
              }}
            />
            <Text style={{ flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 20 }}>{ing}</Text>
          </View>
        ))}
        {compact && ingredients.length > 6 && (
          <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 8 }}>
            +{ingredients.length - 6} more ingredients
          </Text>
        )}

        <Text style={cvStyles.sectionTitle}>How to Cook — Step by Step</Text>
        {showSteps.map((step, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              marginBottom: 12,
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 12,
              padding: 12,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: COLORS.primary,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ color: COLORS.white, fontWeight: "800", fontSize: 13 }}>{i + 1}</Text>
            </View>
            <Text style={{ flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 22 }}>{step}</Text>
          </View>
        ))}

        {recipe.tips && (
          <View
            style={{
              backgroundColor: COLORS.primary + "10",
              padding: 12,
              borderRadius: 10,
              marginTop: 4,
            }}
          >
            <Text style={{ color: COLORS.text, fontSize: 13, lineHeight: 20 }}>
              💡 <Text style={{ fontWeight: "600" }}>Chef Tip:</Text> {recipe.tips}
            </Text>
          </View>
        )}

        {onShare && (
          <TouchableOpacity style={[cvStyles.primaryBtn, { marginTop: 16 }]} onPress={onShare}>
            <Text style={cvStyles.primaryBtnText}>Share to Feed</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
