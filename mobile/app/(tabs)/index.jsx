import {
  View,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CookVerseAPI } from "../../services/cookverseAPI";
import FeedPost from "../../components/FeedPost";
import LoadingSpinner from "../../components/LoadingSpinner";
import { cvStyles } from "../../assets/styles/cookverse.styles";
import { FEED_TABS, PEOPLE_CATEGORIES } from "../../constants/categories";
import { COLORS } from "../../constants/colors";
import { ROUTES } from "../../constants/routes";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_H = Platform.OS === "ios" ? 88 : 72;

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("Latest");
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedHeight, setFeedHeight] = useState(SCREEN_HEIGHT * 0.52);

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "Chef";

  const loadFeed = useCallback(
    async (pageNum = 1, replace = false) => {
      try {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        const data = await CookVerseAPI.getFeed({
          page: pageNum,
          mode: tab,
          userId: user?.id,
        });

        setRecipes((prev) => {
          const merged = replace ? data.recipes : [...prev, ...data.recipes];
          const seen = new Set();
          return merged.filter((r) => {
            if (seen.has(r.id)) return false;
            seen.add(r.id);
            return true;
          });
        });
        setHasMore(data.hasMore);
        setPage(pageNum);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [tab, user?.id]
  );

  useEffect(() => {
    loadFeed(1, true);
  }, [loadFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed(1, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) loadFeed(page + 1);
  };

  if (loading && !refreshing) return <LoadingSpinner message="Loading your feed..." />;

  return (
    <View style={cvStyles.screen}>
      {/* Fixed top section — never scrolls with feed */}
      <View style={[cvStyles.header, { paddingHorizontal: 20, paddingTop: insets.top > 0 ? 4 : 12 }]}>
        <View>
          <Text style={{ fontSize: 14, color: COLORS.textLight }}>Hello,</Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.text }}>{firstName}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.push(ROUTES.categories)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: COLORS.white,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Ionicons name="grid" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(ROUTES.search)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: COLORS.white,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Ionicons name="search" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.text }}>Browse Categories</Text>
          <TouchableOpacity onPress={() => router.push(ROUTES.categories)}>
            <Text style={{ color: COLORS.primary, fontWeight: "600", fontSize: 13 }}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PEOPLE_CATEGORIES.slice(0, 4).map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => router.push({ pathname: ROUTES.categories, params: { name: cat } })}
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: COLORS.border,
                marginRight: 8,
              }}
            >
              <Text style={{ fontWeight: "600", color: COLORS.text, fontSize: 12 }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 6, marginBottom: 8 }}>
        {FEED_TABS.map((t) => {
          const active = tab === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor: active ? COLORS.primary : COLORS.white,
                borderWidth: 1,
                borderColor: active ? COLORS.primary : COLORS.border,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: active ? COLORS.white : COLORS.text,
                }}
                numberOfLines={1}
              >
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feed fills remaining space exactly */}
      <View
        style={{ flex: 1 }}
        onLayout={(e) => {
          const h = Math.floor(e.nativeEvent.layout.height);
          if (h > 100 && h !== feedHeight) setFeedHeight(h);
        }}
      >
        <FlatList
          data={recipes}
          keyExtractor={(item, index) => `recipe-${item.id}-${index}`}
          renderItem={({ item }) => (
            <FeedPost recipe={item} userId={user?.id} itemHeight={feedHeight} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          pagingEnabled
          snapToInterval={feedHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: feedHeight,
            offset: feedHeight * index,
            index,
          })}
          ListFooterComponent={loadingMore ? <LoadingSpinner message="Loading more..." /> : null}
          ListEmptyComponent={
            <View style={[cvStyles.emptyWrap, { height: feedHeight }]}>
              <Ionicons name="restaurant-outline" size={56} color={COLORS.textLight} />
              <Text style={cvStyles.emptyTitle}>No recipes yet</Text>
              <Text style={cvStyles.emptyText}>
                {tab === "Following"
                  ? "Follow chefs to see their recipes here"
                  : "Generate with AI or upload your first recipe!"}
              </Text>
              <TouchableOpacity
                style={[cvStyles.primaryBtn, { paddingHorizontal: 24, marginTop: 16 }]}
                onPress={() => router.push(ROUTES.generate)}
              >
                <Text style={cvStyles.primaryBtnText}>✨ Generate with AI</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </View>
  );
}
