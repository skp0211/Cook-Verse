import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useDebounce } from "../../hooks/useDebounce";
import { CookVerseAPI } from "../../services/cookverseAPI";
import { cvStyles } from "../../assets/styles/cookverse.styles";
import { COLORS } from "../../constants/colors";
import { ROUTES } from "../../constants/routes";
import LoadingSpinner from "../../components/LoadingSpinner";
import AIRecipeCard from "../../components/AIRecipeCard";

const FILTER_TABS = [
  { id: "All", label: "All", icon: "apps" },
  { id: "Recipes", label: "Recipes", icon: "restaurant" },
  { id: "Users", label: "Users", icon: "people" },
  { id: "Hashtags", label: "Tags", icon: "pricetag" },
];

export default function SearchScreen() {
  const router = useRouter();
  const { user } = useUser();
  const params = useLocalSearchParams();
  const [query, setQuery] = useState(params.q || "");
  const [activeTab, setActiveTab] = useState("All");
  const [results, setResults] = useState({ recipes: [], users: [], hashtags: [] });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecipe, setAiRecipe] = useState(null);
  const debouncedQuery = useDebounce(query, 500);

  const generateAIRecipe = useCallback(async (q) => {
    if (!q.trim()) return;
    setAiLoading(true);
    setAiRecipe(null);
    try {
      const recipe = await CookVerseAPI.generateAI({
        query: q.trim(),
        dishName: q.trim(),
        userId: user?.id,
      });
      setAiRecipe(recipe);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  }, [user?.id]);

  const search = async (q) => {
    if (!q.trim()) {
      setResults({ recipes: [], users: [], hashtags: [] });
      setAiRecipe(null);
      return;
    }
    setLoading(true);
    setAiRecipe(null);
    try {
      const type = activeTab.toLowerCase();
      const data = await CookVerseAPI.search(q, type === "all" ? "all" : type);
      let users = [];
      if (activeTab === "All" || activeTab === "Users") {
        users = await CookVerseAPI.searchUsers(q).catch(() => []);
      }
      const next = { recipes: data.recipes || [], users, hashtags: data.hashtags || [] };
      setResults(next);

      const shouldAutoAI =
        (activeTab === "All" || activeTab === "Recipes") &&
        next.recipes.length === 0 &&
        (activeTab === "Recipes" || next.users.length === 0);

      if (shouldAutoAI) {
        generateAIRecipe(q);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedQuery.trim()) search(debouncedQuery);
  }, [debouncedQuery, activeTab]);

  const onChangeQuery = (text) => {
    setQuery(text);
    if (!text.trim()) {
      setResults({ recipes: [], users: [], hashtags: [] });
      setAiRecipe(null);
    }
  };

  const listData = useMemo(() => {
    if (activeTab === "Recipes") {
      return results.recipes.map((r) => ({ ...r, _type: "recipe" }));
    }
    if (activeTab === "Users") {
      return results.users.map((u) => ({ ...u, _type: "user" }));
    }
    if (activeTab === "Hashtags") {
      return results.hashtags.map((h) => ({ tag: h, _type: "hashtag" }));
    }
    return [
      ...results.recipes.map((r) => ({ ...r, _type: "recipe" })),
      ...results.users.map((u) => ({ ...u, _type: "user" })),
      ...results.hashtags.map((h) => ({ tag: h, _type: "hashtag" })),
    ];
  }, [results, activeTab]);

  const hasResults = listData.length > 0;

  const saveToFeed = async () => {
    if (!aiRecipe || !user?.id) return;
    try {
      const saved = await CookVerseAPI.createRecipe({
        title: aiRecipe.title,
        image: aiRecipe.image,
        ingredients: aiRecipe.ingredients,
        steps: aiRecipe.steps,
        cookingTime: aiRecipe.cookingTime,
        difficulty: aiRecipe.difficulty,
        calories: aiRecipe.calories,
        nutrition: aiRecipe.nutrition,
        tips: aiRecipe.tips,
        isAIGenerated: true,
        createdBy: user.id,
        creatorName: user.fullName || "CookVerse Chef",
        creatorAvatar: user.imageUrl,
        category: "AI Generated",
        dietType: "Vegetarian",
      });
      router.push(`/recipe/${saved.id}?source=cookverse`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={cvStyles.screen}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={cvStyles.headerTitle}>Search</Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: COLORS.white,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: COLORS.border,
            paddingHorizontal: 14,
            height: 48,
          }}
        >
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 15,
              color: COLORS.text,
            }}
            placeholder="Search biryani, pasta, users..."
            placeholderTextColor={COLORS.textLight}
            value={query}
            onChangeText={onChangeQuery}
            autoFocus={!!params.q}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => onChangeQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter buttons — equal width row */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          gap: 8,
          marginBottom: 12,
        }}
      >
        {FILTER_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: active ? COLORS.primary : COLORS.white,
                borderWidth: 1,
                borderColor: active ? COLORS.primary : COLORS.border,
              }}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={active ? COLORS.white : COLORS.textLight}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: active ? COLORS.white : COLORS.text,
                  marginTop: 4,
                }}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <LoadingSpinner message="Searching..." />
      ) : !hasResults && query.trim() ? (
        <FlatList
          data={[{ _type: "ai" }]}
          keyExtractor={() => "ai"}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={() => (
            <View>
              <View style={[cvStyles.emptyWrap, { paddingVertical: 20 }]}>
                <Ionicons name="sparkles" size={40} color={COLORS.primary} />
                <Text style={[cvStyles.emptyTitle, { fontSize: 18, marginTop: 8 }]}>
                  No {activeTab === "All" ? "results" : activeTab.toLowerCase()} for &quot;{query}&quot;
                </Text>
                {(activeTab === "All" || activeTab === "Recipes") && (
                  <Text style={cvStyles.emptyText}>
                    CookVerse AI is creating a full recipe with matching image...
                  </Text>
                )}
              </View>

              {(activeTab === "All" || activeTab === "Recipes") && (
                aiLoading ? (
                  <LoadingSpinner message={`Creating ${query} recipe...`} />
                ) : aiRecipe ? (
                  <AIRecipeCard recipe={aiRecipe} onShare={user?.id ? saveToFeed : undefined} />
                ) : (
                  <TouchableOpacity
                    style={[cvStyles.primaryBtn, { marginTop: 8 }]}
                    onPress={() => generateAIRecipe(query)}
                  >
                    <Text style={cvStyles.primaryBtnText}>✨ Generate with AI</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}
        />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, i) => `${item._type}-${item.id || item.tag || i}`}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListHeaderComponent={
            aiRecipe && hasResults && (activeTab === "All" || activeTab === "Recipes") ? (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: COLORS.textLight, marginBottom: 8, fontWeight: "600" }}>
                  AI Recipe for you:
                </Text>
                <AIRecipeCard recipe={aiRecipe} compact onShare={user?.id ? saveToFeed : undefined} />
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            if (item._type === "recipe") {
              return (
                <TouchableOpacity
                  style={[cvStyles.card, { flexDirection: "row", gap: 12, padding: 12, marginBottom: 10 }]}
                  onPress={() => router.push(`/recipe/${item.id}?source=cookverse`)}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 80, height: 80, borderRadius: 12 }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text style={{ fontWeight: "700", color: COLORS.text, fontSize: 15 }}>
                      {item.title}
                    </Text>
                    <Text style={{ color: COLORS.textLight, fontSize: 12, marginTop: 4 }}>
                      {item.category} · {item.cookingTime}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              );
            }
            if (item._type === "user") {
              return (
                <View
                  style={[
                    cvStyles.card,
                    { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10, padding: 12 },
                  ]}
                >
                  <Image
                    source={{
                      uri: item.avatarUrl || "https://api.dicebear.com/7.x/avataaars/png?seed=user",
                    }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />
                  <Text style={{ fontWeight: "700", color: COLORS.text, flex: 1 }}>{item.fullName}</Text>
                </View>
              );
            }
            return (
              <TouchableOpacity
                style={[
                  cvStyles.card,
                  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10, padding: 14 },
                ]}
                onPress={() => router.push({ pathname: ROUTES.categories, params: { name: item.tag } })}
              >
                <Ionicons name="pricetag" size={18} color={COLORS.primary} />
                <Text style={{ fontWeight: "700", color: COLORS.text, fontSize: 15 }}>#{item.tag}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
