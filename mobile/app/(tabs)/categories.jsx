import { View, Text, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { CookVerseAPI } from "../../services/cookverseAPI";
import { PEOPLE_CATEGORIES, CUISINE_CATEGORIES } from "../../constants/categories";
import { cvStyles } from "../../assets/styles/cookverse.styles";
import { COLORS } from "../../constants/colors";
import LoadingSpinner from "../../components/LoadingSpinner";

const CATEGORY_ICONS = {
  "Gym Recipes": "barbell",
  "Weight Loss": "fitness",
  "Diabetic Friendly": "medkit",
  Vegan: "leaf",
  Vegetarian: "nutrition",
  "North Indian": "flame",
  "South Indian": "cafe",
  Bengali: "fish",
  Italian: "pizza",
  Chinese: "restaurant",
};

function CategoryCard({ name, onPress }) {
  const icon = CATEGORY_ICONS[name] || "restaurant-outline";
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: "47%",
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: COLORS.background,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        <Ionicons name={icon} size={24} color={COLORS.primary} />
      </View>
      <Text style={{ fontWeight: "700", color: COLORS.text, textAlign: "center", fontSize: 13 }}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(name || null);

  useEffect(() => {
    if (name) setSelected(name);
  }, [name]);

  useEffect(() => {
    if (selected) loadCategory(selected);
  }, [selected]);

  const loadCategory = async (cat) => {
    setLoading(true);
    try {
      const data = await CookVerseAPI.getByCategory(cat);
      setRecipes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (selected) {
    return (
      <View style={cvStyles.screen}>
        <View style={[cvStyles.header, { padding: 16 }]}>
          <TouchableOpacity onPress={() => setSelected(null)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={cvStyles.headerTitle}>{selected}</Text>
          <View style={{ width: 24 }} />
        </View>
        {loading ? (
          <LoadingSpinner message="Loading recipes..." />
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[cvStyles.card, { flexDirection: "row", gap: 12, padding: 12 }]}
                onPress={() => router.push(`/recipe/${item.id}?source=cookverse`)}
              >
                <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: COLORS.text }}>{item.title}</Text>
                  <Text style={{ color: COLORS.textLight }}>
                    {item.cookingTime} · {item.difficulty}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={cvStyles.emptyWrap}>
                <Ionicons name="sparkles" size={40} color={COLORS.primary} />
                <Text style={cvStyles.emptyTitle}>No recipes yet</Text>
                <Text style={cvStyles.emptyText}>
                  Generate a {selected} recipe with AI
                </Text>
                <TouchableOpacity
                  style={[cvStyles.primaryBtn, { marginTop: 16, paddingHorizontal: 24 }]}
                  onPress={() =>
                    router.push({
                      pathname: "/generate",
                      params: { q: `How to cook ${selected} recipe` },
                    })
                  }
                >
                  <Text style={cvStyles.primaryBtnText}>✨ Generate with AI</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    );
  }

  return (
    <ScrollView style={cvStyles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={cvStyles.headerTitle}>Categories</Text>

      <Text style={cvStyles.sectionTitle}>People-Based</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {PEOPLE_CATEGORIES.map((c) => (
          <CategoryCard key={c} name={c} onPress={() => setSelected(c)} />
        ))}
      </View>

      <Text style={[cvStyles.sectionTitle, { marginTop: 16 }]}>Cuisines (By State / Type)</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {CUISINE_CATEGORIES.map((c) => (
          <CategoryCard key={c} name={c} onPress={() => setSelected(c)} />
        ))}
      </View>
    </ScrollView>
  );
}
