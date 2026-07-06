import { View, Text, TouchableOpacity, Share, Dimensions, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../constants/colors";
import { CookVerseAPI } from "../services/cookverseAPI";

const { width } = Dimensions.get("window");

function toHandle(name) {
  if (!name) return "@chef";
  return `@${name.toLowerCase().replace(/\s+/g, "_")}`;
}

export default function FeedPost({ recipe, userId, itemHeight }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(recipe.likesCount || 0);

  useEffect(() => {
    if (!userId || !recipe.id) return;
    const requests = [
      CookVerseAPI.getLikeStatus(recipe.id, userId),
      CookVerseAPI.getSaveStatus(recipe.id, userId),
    ];
    if (recipe.createdBy && recipe.createdBy !== userId) {
      requests.push(CookVerseAPI.getFollowStatus(userId, recipe.createdBy));
    }
    Promise.all(requests).then((results) => {
      setLiked(results[0].liked);
      setSaved(results[1].saved);
      if (results[2]) setFollowing(results[2].following);
    });
  }, [recipe.id, recipe.createdBy, userId]);

  const handleLike = async () => {
    if (!userId) return;
    const res = await CookVerseAPI.toggleLike(recipe.id, userId);
    setLiked(res.liked);
    setLikesCount((c) => (res.liked ? c + 1 : Math.max(0, c - 1)));
  };

  const handleSave = async () => {
    if (!userId) return;
    const res = await CookVerseAPI.toggleSave(recipe.id, userId);
    setSaved(res.saved);
  };

  const handleShare = async () => {
    await Share.share({ message: `Check out "${recipe.title}" on CookVerse! 🍳` });
  };

  const handleFollow = async () => {
    if (!userId || recipe.createdBy === userId) return;
    const res = await CookVerseAPI.toggleFollow(userId, recipe.createdBy);
    setFollowing(res.following);
  };

  const handle = toHandle(recipe.creatorName);
  const postHeight = itemHeight || 420;

  return (
    <View style={[styles.container, { height: postHeight }]}>
      <TouchableOpacity
        style={styles.mediaWrap}
        activeOpacity={0.98}
        onPress={() => router.push(`/recipe/${recipe.id}?source=cookverse`)}
      >
        <Image
          source={{ uri: recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" }}
          style={styles.media}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.sideActions}>
          <TouchableOpacity style={styles.sideBtn} onPress={handleLike}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={28} color={liked ? "#FF4D6D" : COLORS.white} />
            <Text style={styles.sideLabel}>{likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={() => router.push(`/recipe/${recipe.id}?source=cookverse`)}
          >
            <Ionicons name="chatbubble-outline" size={26} color={COLORS.white} />
            <Text style={styles.sideLabel}>Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={26} color={COLORS.white} />
            <Text style={styles.sideLabel}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn} onPress={handleSave}>
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={26} color={COLORS.white} />
            <Text style={styles.sideLabel}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomOverlay}>
          <View style={styles.creatorRow}>
            <Image
              source={{
                uri: recipe.creatorAvatar || "https://api.dicebear.com/7.x/avataaars/png?seed=chef",
              }}
              style={styles.avatar}
            />
            <Text style={styles.handle} numberOfLines={1}>
              {handle}
            </Text>
            {recipe.createdBy !== userId && (
              <TouchableOpacity
                style={[styles.followBtn, following && styles.followingBtn]}
                onPress={handleFollow}
              >
                <Text style={[styles.followText, following && styles.followingText]}>
                  {following ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {[recipe.cookingTime, recipe.difficulty, recipe.calories ? `${recipe.calories} kcal` : null]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          {recipe.category ? (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{recipe.category}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    overflow: "hidden",
  },
  mediaWrap: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 0,
    overflow: "hidden",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  sideActions: {
    position: "absolute",
    right: 10,
    bottom: 90,
    alignItems: "center",
    gap: 16,
  },
  sideBtn: { alignItems: "center", gap: 3 },
  sideLabel: { color: COLORS.white, fontSize: 10, fontWeight: "600" },
  bottomOverlay: {
    position: "absolute",
    left: 14,
    right: 64,
    bottom: 16,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  handle: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
  },
  followBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  followingBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  followText: { color: COLORS.white, fontWeight: "700", fontSize: 11 },
  followingText: { color: COLORS.white },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
    lineHeight: 24,
  },
  meta: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginBottom: 6,
  },
  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "600",
  },
});
