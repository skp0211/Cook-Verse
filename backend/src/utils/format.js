export function parseJsonField(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value) || (typeof value === "object" && value !== null)) return value;

  let current = value;
  for (let i = 0; i < 3; i++) {
    if (typeof current !== "string") break;
    const trimmed = current.trim();
    if (!trimmed || trimmed === "[]" || trimmed === "{}") return fallback;
    try {
      current = JSON.parse(trimmed);
    } catch {
      return fallback;
    }
  }

  return current ?? fallback;
}

export function formatRecipe(row) {
  if (!row) return null;
  return {
    ...row,
    ingredients: parseJsonField(row.ingredients, []),
    steps: parseJsonField(row.steps, []),
    nutrition: parseJsonField(row.nutrition, {}),
  };
}

export function formatUser(row, stats = {}) {
  if (!row) return { ...stats };
  return { ...row, ...stats };
}
