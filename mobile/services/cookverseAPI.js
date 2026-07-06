import { API_URL } from "../constants/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const CookVerseAPI = {
  getUser: (userId) => request(`/users/${userId}`),
  createProfile: (profile) =>
    request("/users", { method: "POST", body: JSON.stringify(profile) }),
  searchUsers: (q) => request(`/users/search/${encodeURIComponent(q)}`),

  getFeed: ({ page = 1, mode, category, userId } = {}) => {
    const modeMap = {
      Latest: "latest",
      Trending: "trending",
      "For You": "foryou",
      Following: "following",
      All: "latest",
    };
    const params = new URLSearchParams({ page: String(page), limit: "8" });
    const resolved = modeMap[mode] || mode?.toLowerCase()?.replace(/\s/g, "") || "all";
    params.set("mode", resolved);
    if (category) params.set("category", category);
    if (userId) params.set("userId", userId);
    return request(`/recipes/feed?${params}`);
  },

  search: (q, type = "all") =>
    request(`/recipes/search?q=${encodeURIComponent(q)}&type=${type}`),

  getByCategory: (name) => request(`/recipes/category/${encodeURIComponent(name)}`),

  getRecipe: (id) => request(`/recipes/${id}`),

  createRecipe: (recipe) =>
    request("/recipes", { method: "POST", body: JSON.stringify(recipe) }),

  updateRecipe: (id, data) =>
    request(`/recipes/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteRecipe: (id, userId) =>
    request(`/recipes/${id}?userId=${encodeURIComponent(userId)}`, { method: "DELETE" }),

  generateAI: ({ ingredients, query, dishName, userId }) =>
    request("/recipes/ai/generate", {
      method: "POST",
      body: JSON.stringify({ ingredients, query, dishName, userId }),
    }),

  getAIHistory: (userId) => request(`/recipes/ai/history/${userId}`),

  getUserRecipes: (userId, type) =>
    request(`/recipes/user/${userId}?type=${type || "posts"}`),

  getComments: (recipeId) => request(`/recipes/${recipeId}/comments`),

  addComment: (recipeId, data) =>
    request(`/recipes/${recipeId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  toggleLike: (recipeId, userId) =>
    request(`/recipes/${recipeId}/like`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  getLikeStatus: (recipeId, userId) => request(`/recipes/${recipeId}/like/${userId}`),

  toggleSave: (recipeId, userId) =>
    request(`/recipes/${recipeId}/save`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  getSaveStatus: (recipeId, userId) => request(`/recipes/${recipeId}/save/${userId}`),

  toggleFollow: (followerId, followingId) =>
    request("/follows/toggle", {
      method: "POST",
      body: JSON.stringify({ followerId, followingId }),
    }),

  getFollowStatus: (followerId, followingId) =>
    request(`/follows/status/${followerId}/${followingId}`),

  getFollowers: (userId) => request(`/follows/followers/${userId}`),

  getFollowing: (userId) => request(`/follows/following/${userId}`),

  deactivateAccount: (userId) =>
    request(`/users/${userId}/deactivate`, {
      method: "PATCH",
      body: JSON.stringify({ requestUserId: userId }),
    }),

  reactivateAccount: (userId) =>
    request(`/users/${userId}/reactivate`, { method: "PATCH" }),

  deleteAccount: (userId) =>
    request(`/users/${userId}`, {
      method: "DELETE",
      body: JSON.stringify({ requestUserId: userId }),
    }),
};
