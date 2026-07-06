import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { CookVerseAPI } from "../../services/cookverseAPI";
import { cvStyles } from "../../assets/styles/cookverse.styles";
import { COLORS } from "../../constants/colors";
import LoadingSpinner from "../../components/LoadingSpinner";
import ActionSheetModal from "../../components/ActionSheetModal";
import ConfirmModal from "../../components/ConfirmModal";
import { ROUTES } from "../../constants/routes";

const PROFILE_TABS = ["My Recipes", "Saved", "Liked"];

export default function ProfileScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("My Recipes");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeActions, setShowRecipeActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadProfile = async () => {
    if (!user?.id) return;
    try {
      const p = await CookVerseAPI.getUser(user.id);
      setProfile(p);
      setBio(p?.bio || "");
    } catch (e) {
      console.error(e);
    }
  };

  const loadRecipes = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const type =
        activeTab === "Saved" ? "saved" : activeTab === "Liked" ? "liked" : "posts";
      const data = await CookVerseAPI.getUserRecipes(user.id, type);
      setRecipes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  useEffect(() => {
    loadRecipes();
  }, [activeTab, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadRecipes();
    }, [user?.id, activeTab])
  );

  const handleRecipePress = (item) => {
    if (activeTab === "My Recipes") {
      setSelectedRecipe(item);
      setShowRecipeActions(true);
    } else {
      router.push(`/recipe/${item.id}?source=cookverse`);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!selectedRecipe) return;
    try {
      await CookVerseAPI.deleteRecipe(selectedRecipe.id, user.id);
      setSelectedRecipe(null);
      loadRecipes();
      loadProfile();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const saveBio = async () => {
    try {
      await CookVerseAPI.createProfile({
        id: user.id,
        fullName: user.fullName,
        bio,
        avatarUrl: user.imageUrl,
      });
      setEditing(false);
      loadProfile();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  if (!user) return <LoadingSpinner message="Loading profile..." />;

  return (
    <>
      <ScrollView style={cvStyles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ alignItems: "center", padding: 20 }}>
        <View style={{ width: "100%", flexDirection: "row", justifyContent: "flex-end", marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => router.push(ROUTES.settings)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: COLORS.white,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Ionicons name="settings-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: user.imageUrl || "https://api.dicebear.com/7.x/avataaars/png?seed=me" }}
          style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.text }}>
          {profile?.fullName || user.fullName || "CookVerse Chef"}
        </Text>
        {editing ? (
          <TextInput
            style={[cvStyles.input, { width: "100%", marginTop: 8 }]}
            value={bio}
            onChangeText={setBio}
            placeholder="Your bio..."
            placeholderTextColor={COLORS.textLight}
          />
        ) : (
          <Text style={{ color: COLORS.textLight, marginTop: 4, textAlign: "center" }}>
            {profile?.bio || "Food lover on CookVerse 🍳"}
          </Text>
        )}

        <View style={{ flexDirection: "row", gap: 32, marginTop: 20 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "800", fontSize: 18, color: COLORS.text }}>
              {profile?.postsCount || 0}
            </Text>
            <Text style={{ color: COLORS.textLight, fontSize: 12 }}>Posts</Text>
          </View>
          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={() =>
              router.push(`${ROUTES.followList}?type=followers&userId=${user.id}`)
            }
          >
            <Text style={{ fontWeight: "800", fontSize: 18, color: COLORS.text }}>
              {profile?.followersCount || 0}
            </Text>
            <Text style={{ color: COLORS.textLight, fontSize: 12 }}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={() =>
              router.push(`${ROUTES.followList}?type=following&userId=${user.id}`)
            }
          >
            <Text style={{ fontWeight: "800", fontSize: 18, color: COLORS.text }}>
              {profile?.followingCount || 0}
            </Text>
            <Text style={{ color: COLORS.textLight, fontSize: 12 }}>Following</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
          <TouchableOpacity
            style={[cvStyles.secondaryBtn, { flex: 1, marginTop: 0 }]}
            onPress={() => (editing ? saveBio() : setEditing(true))}
          >
            <Text style={cvStyles.secondaryBtnText}>{editing ? "Save" : "Edit Profile"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cvStyles.chipRow}>
        {PROFILE_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[cvStyles.chip, activeTab === tab && cvStyles.chipActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[cvStyles.chipText, activeTab === tab && cvStyles.chipTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <LoadingSpinner message="Loading recipes..." />
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", padding: 8 }}>
          {recipes.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{ width: "33.33%", padding: 4 }}
              onPress={() => handleRecipePress(item)}
            >
              <Image
                source={{ uri: item.image || "https://source.unsplash.com/200x200/?food" }}
                style={{ width: "100%", aspectRatio: 1, borderRadius: 10 }}
                contentFit="cover"
              />
            </TouchableOpacity>
          ))}
          {!recipes.length && (
            <Text style={[cvStyles.emptyText, { width: "100%", textAlign: "center", padding: 24 }]}>
              No recipes here yet
            </Text>
          )}
        </View>
      )}
      </ScrollView>

      <ActionSheetModal
        visible={showRecipeActions}
        title={selectedRecipe?.title}
        message="What would you like to do?"
        onClose={() => setShowRecipeActions(false)}
        actions={[
          {
            label: "View",
            onPress: () =>
              router.push(`/recipe/${selectedRecipe?.id}?source=cookverse`),
          },
          {
            label: "Edit",
            onPress: () => router.push(ROUTES.editRecipe(selectedRecipe?.id)),
          },
          {
            label: "Delete",
            destructive: true,
            keepOpen: true,
            onPress: () => {
              setShowRecipeActions(false);
              setShowDeleteConfirm(true);
            },
          },
        ]}
      />

      <ConfirmModal
        visible={showDeleteConfirm}
        title="Delete Recipe"
        message="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedRecipe(null);
        }}
        onConfirm={handleDeleteRecipe}
      />
    </>
  );
}
