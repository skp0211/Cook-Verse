import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../../constants/api";
import { MealAPI } from "../../services/mealAPI";
import { CookVerseAPI } from "../../services/cookverseAPI";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Image } from "expo-image";
import { recipeDetailStyles } from "../../assets/styles/recipe-detail.styles";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { normalizeIngredients, normalizeSteps } from "../../utils/recipeHelpers";

const RecipeDetailScreen = () => {
  const { id: recipeId, source } = useLocalSearchParams();
  const router = useRouter();
  const isCookVerse = source === "cookverse";

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useUser();
  const userId = user?.id;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (isCookVerse) {
          const data = await CookVerseAPI.getRecipe(recipeId);
          setRecipe(data);
          setLikesCount(data.likesCount || 0);

          if (userId) {
            const [likeRes, saveRes] = await Promise.all([
              CookVerseAPI.getLikeStatus(recipeId, userId),
              CookVerseAPI.getSaveStatus(recipeId, userId),
            ]);
            setIsLiked(likeRes.liked);
            setIsSaved(saveRes.saved);

            if (data.createdBy && data.createdBy !== userId) {
              const followRes = await CookVerseAPI.getFollowStatus(userId, data.createdBy);
              setFollowing(followRes.following);
            }
          }

          const cmts = await CookVerseAPI.getComments(recipeId);
          setComments(cmts);
        } else {
          const response = await fetch(`${API_URL}/favorites/${userId}`);
          const favorites = await response.json();
          setIsSaved(favorites.some((fav) => fav.recipeId === parseInt(recipeId)));

          const mealData = await MealAPI.getMealById(recipeId);
          if (mealData) {
            const transformed = MealAPI.transformMealData(mealData);
            setRecipe({ ...transformed, youtubeUrl: mealData.strYoutube || null });
          }
        }
      } catch (error) {
        console.error("Error loading recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [recipeId, userId, isCookVerse]);

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.split("v=")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleToggleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      if (isCookVerse) {
        const res = await CookVerseAPI.toggleSave(recipeId, userId);
        setIsSaved(res.saved);
      } else {
        if (isSaved) {
          await fetch(`${API_URL}/favorites/${userId}/${recipeId}`, { method: "DELETE" });
          setIsSaved(false);
        } else {
          await fetch(`${API_URL}/favorites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              recipeId: parseInt(recipeId),
              title: recipe.title,
              image: recipe.image,
              cookTime: recipe.cookTime,
              servings: recipe.servings,
            }),
          });
          setIsSaved(true);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = async () => {
    if (!userId || !isCookVerse) return;
    const res = await CookVerseAPI.toggleLike(recipeId, userId);
    setIsLiked(res.liked);
    setLikesCount((c) => (res.liked ? c + 1 : Math.max(0, c - 1)));
  };

  const handleFollow = async () => {
    if (!userId || !recipe?.createdBy) return;
    const res = await CookVerseAPI.toggleFollow(userId, recipe.createdBy);
    setFollowing(res.following);
  };

  const handleShare = async () => {
    await Share.share({ message: `Check out "${recipe.title}" on CookVerse! 🍳` });
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !userId) return;
    const c = await CookVerseAPI.addComment(recipeId, {
      userId,
      userName: user.fullName || "Chef",
      userAvatar: user.imageUrl,
      text: commentText.trim(),
    });
    setComments([c, ...comments]);
    setCommentText("");
  };

  if (loading) return <LoadingSpinner message="Loading recipe details..." />;
  if (!recipe) return <LoadingSpinner message="Recipe not found" />;

  const ingredients = isCookVerse
    ? normalizeIngredients(recipe.ingredients)
    : recipe.ingredients || [];
  const instructions = isCookVerse ? normalizeSteps(recipe.steps) : recipe.instructions || [];

  return (
    <View style={recipeDetailStyles.container}>
      <ScrollView>
        <View style={recipeDetailStyles.headerContainer}>
          <View style={recipeDetailStyles.imageContainer}>
            <Image
              source={{ uri: recipe.image }}
              style={recipeDetailStyles.headerImage}
              contentFit="cover"
            />
          </View>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]}
            style={recipeDetailStyles.gradientOverlay}
          />

          <View style={recipeDetailStyles.floatingButtons}>
            <TouchableOpacity style={recipeDetailStyles.floatingButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            {isCookVerse && recipe.createdBy === userId && (
              <>
                <TouchableOpacity
                  style={recipeDetailStyles.floatingButton}
                  onPress={() => router.push(`/edit-recipe/${recipeId}`)}
                >
                  <Ionicons name="create-outline" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[recipeDetailStyles.floatingButton, { backgroundColor: "#E53935" }]}
                  onPress={() => {
                    Alert.alert("Delete Recipe", "This cannot be undone.", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await CookVerseAPI.deleteRecipe(recipeId, userId);
                            router.back();
                          } catch (e) {
                            Alert.alert("Error", e.message);
                          }
                        },
                      },
                    ]);
                  }}
                >
                  <Ionicons name="trash-outline" size={22} color={COLORS.white} />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={recipeDetailStyles.floatingButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[recipeDetailStyles.floatingButton, { backgroundColor: COLORS.primary }]}
              onPress={handleToggleSave}
              disabled={isSaving}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>

          <View style={recipeDetailStyles.titleSection}>
            {recipe.category && (
              <View style={recipeDetailStyles.categoryBadge}>
                <Text style={recipeDetailStyles.categoryText}>{recipe.category}</Text>
              </View>
            )}
            <Text style={recipeDetailStyles.recipeTitle}>{recipe.title}</Text>
            {isCookVerse && recipe.creatorName && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 }}>
                <Text style={{ color: COLORS.white }}>{recipe.creatorName}</Text>
                {recipe.createdBy !== userId && (
                  <TouchableOpacity onPress={handleFollow}>
                    <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                      {following ? "Following" : "Follow"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={recipeDetailStyles.contentSection}>
          <View style={recipeDetailStyles.statsContainer}>
            <View style={recipeDetailStyles.statCard}>
              <LinearGradient colors={["#FF6B6B", "#FF8E53"]} style={recipeDetailStyles.statIconContainer}>
                <Ionicons name="time" size={20} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.statValue}>{recipe.cookingTime || recipe.cookTime}</Text>
              <Text style={recipeDetailStyles.statLabel}>Time</Text>
            </View>
            {isCookVerse && (
              <>
                <View style={recipeDetailStyles.statCard}>
                  <LinearGradient colors={["#4ECDC4", "#44A08D"]} style={recipeDetailStyles.statIconContainer}>
                    <Ionicons name="flame" size={20} color={COLORS.white} />
                  </LinearGradient>
                  <Text style={recipeDetailStyles.statValue}>{recipe.calories || "—"}</Text>
                  <Text style={recipeDetailStyles.statLabel}>Calories</Text>
                </View>
                <View style={recipeDetailStyles.statCard}>
                  <LinearGradient colors={["#9C27B0", "#673AB7"]} style={recipeDetailStyles.statIconContainer}>
                    <Ionicons name="barbell" size={20} color={COLORS.white} />
                  </LinearGradient>
                  <Text style={recipeDetailStyles.statValue}>{recipe.difficulty || "—"}</Text>
                  <Text style={recipeDetailStyles.statLabel}>Level</Text>
                </View>
              </>
            )}
            {!isCookVerse && (
              <View style={recipeDetailStyles.statCard}>
                <LinearGradient colors={["#4ECDC4", "#44A08D"]} style={recipeDetailStyles.statIconContainer}>
                  <Ionicons name="people" size={20} color={COLORS.white} />
                </LinearGradient>
                <Text style={recipeDetailStyles.statValue}>{recipe.servings}</Text>
                <Text style={recipeDetailStyles.statLabel}>Servings</Text>
              </View>
            )}
          </View>

          {isCookVerse && recipe.nutrition && (
            <Text style={{ color: COLORS.primary, fontWeight: "600", marginBottom: 16 }}>
              Protein {recipe.nutrition.protein} · Carbs {recipe.nutrition.carbs} · Fat {recipe.nutrition.fat}
            </Text>
          )}

          {recipe.youtubeUrl && (
            <View style={recipeDetailStyles.sectionContainer}>
              <Text style={recipeDetailStyles.sectionTitle}>Video Tutorial</Text>
              <View style={recipeDetailStyles.videoCard}>
                <WebView
                  style={recipeDetailStyles.webview}
                  source={{ uri: getYouTubeEmbedUrl(recipe.youtubeUrl) }}
                  allowsFullscreenVideo
                />
              </View>
            </View>
          )}

          <View style={recipeDetailStyles.sectionContainer}>
            <Text style={recipeDetailStyles.sectionTitle}>
              Ingredients ({ingredients.length})
            </Text>
            <View style={recipeDetailStyles.ingredientsGrid}>
              {ingredients.length === 0 ? (
                <Text style={{ color: COLORS.textLight, fontSize: 15 }}>
                  Ingredients not available for this recipe.
                </Text>
              ) : (
                ingredients.map((ingredient, index) => (
                  <View key={index} style={recipeDetailStyles.ingredientCard}>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: COLORS.primary,
                        marginRight: 10,
                        marginTop: 7,
                      }}
                    />
                    <Text style={[recipeDetailStyles.ingredientText, { flex: 1 }]}>
                      {ingredient}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={recipeDetailStyles.sectionContainer}>
            <Text style={recipeDetailStyles.sectionTitle}>
              How to Cook — Step by Step
            </Text>
            <View style={recipeDetailStyles.instructionsContainer}>
              {instructions.length === 0 ? (
                <Text style={{ color: COLORS.textLight, fontSize: 15 }}>
                  Cooking steps not available for this recipe.
                </Text>
              ) : (
                instructions.map((instruction, index) => (
                  <View key={index} style={recipeDetailStyles.instructionCard}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: COLORS.primary,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                      }}
                    >
                      <Text style={{ color: COLORS.white, fontWeight: "800", fontSize: 14 }}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[recipeDetailStyles.instructionText, { flex: 1, lineHeight: 22 }]}>
                      {instruction}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {isCookVerse && recipe.tips && (
            <Text style={{ color: COLORS.textLight, fontStyle: "italic", marginBottom: 16 }}>
              💡 {recipe.tips}
            </Text>
          )}

          {isCookVerse && (
            <View style={recipeDetailStyles.sectionContainer}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <TouchableOpacity onPress={handleLike} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={COLORS.primary} />
                  <Text style={{ fontWeight: "700", color: COLORS.text }}>{likesCount}</Text>
                </TouchableOpacity>
              </View>

              <Text style={recipeDetailStyles.sectionTitle}>Comments</Text>
              <TextInput
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                  color: COLORS.text,
                }}
              />
              <TouchableOpacity onPress={handleAddComment} style={{ marginBottom: 16 }}>
                <Text style={{ color: COLORS.primary, fontWeight: "700" }}>Post Comment</Text>
              </TouchableOpacity>
              {comments.map((c) => (
                <View key={c.id} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: "700", color: COLORS.text }}>{c.userName}</Text>
                  <Text style={{ color: COLORS.textLight }}>{c.text}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={recipeDetailStyles.primaryButton} onPress={handleToggleSave} disabled={isSaving}>
            <LinearGradient colors={[COLORS.primary, COLORS.primary + "CC"]} style={recipeDetailStyles.buttonGradient}>
              <Ionicons name="bookmark" size={20} color={COLORS.white} />
              <Text style={recipeDetailStyles.buttonText}>
                {isSaved ? "Saved" : "Save Recipe"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default RecipeDetailScreen;
