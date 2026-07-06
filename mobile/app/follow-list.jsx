import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState, useCallback } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { CookVerseAPI } from "../services/cookverseAPI";
import { COLORS } from "../constants/colors";
import LoadingSpinner from "../components/LoadingSpinner";

export default function FollowListScreen() {
  const { type, userId: paramUserId } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();
  const targetUserId = paramUserId || user?.id;
  const isFollowingList = type === "following";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followStates, setFollowStates] = useState({});

  const loadList = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const data = isFollowingList
        ? await CookVerseAPI.getFollowing(targetUserId)
        : await CookVerseAPI.getFollowers(targetUserId);
      setUsers(data);

      if (user?.id) {
        const states = {};
        await Promise.all(
          data.map(async (u) => {
            if (u.userId !== user.id) {
              const res = await CookVerseAPI.getFollowStatus(user.id, u.userId);
              states[u.userId] = res.following;
            }
          })
        );
        setFollowStates(states);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, isFollowingList, user?.id]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleToggleFollow = async (otherUserId) => {
    if (!user?.id || otherUserId === user.id) return;
    const res = await CookVerseAPI.toggleFollow(user.id, otherUserId);
    setFollowStates((prev) => ({ ...prev, [otherUserId]: res.following }));

    if (isFollowingList && targetUserId === user.id && !res.following) {
      setUsers((prev) => prev.filter((u) => u.userId !== otherUserId));
    }
  };

  const renderItem = ({ item }) => {
    const isSelf = item.userId === user?.id;
    const isFollowing = followStates[item.userId];

    return (
      <View style={styles.row}>
        <Image
          source={{
            uri: item.avatarUrl || "https://api.dicebear.com/7.x/avataaars/png?seed=chef",
          }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{item.fullName || "CookVerse Chef"}</Text>
          {item.bio ? (
            <Text style={styles.bio} numberOfLines={1}>
              {item.bio}
            </Text>
          ) : null}
        </View>
        {!isSelf && user?.id && (
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={() => handleToggleFollow(item.userId)}
          >
            <Text style={[styles.followText, isFollowing && styles.followingText]}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{isFollowingList ? "Following" : "Followers"}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <LoadingSpinner message="Loading..." />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.userId)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {isFollowingList ? "Not following anyone yet" : "No followers yet"}
            </Text>
          }
        />
      )}
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
  title: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  bio: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  followBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  followText: { color: COLORS.white, fontWeight: "700", fontSize: 13 },
  followingText: { color: COLORS.text },
  empty: { textAlign: "center", color: COLORS.textLight, marginTop: 40, fontSize: 15 },
});
