import { parseJsonField } from "./format.js";

export function isEmptyRecipeContent(value) {
  const parsed = parseJsonField(value, []);
  return !Array.isArray(parsed) || parsed.length === 0;
}

export function buildSeedLookup(seedRecipes) {
  const map = new Map();
  for (const seed of seedRecipes) {
    const ingredients = parseJsonField(seed.ingredients, []);
    const steps = parseJsonField(seed.steps, []);
    if (seed.title && ingredients.length && steps.length) {
      map.set(seed.title, {
        ingredients: JSON.stringify(ingredients),
        steps: JSON.stringify(steps),
        nutrition: seed.nutrition,
        tips: seed.tips,
        cookingTime: seed.cookingTime,
        difficulty: seed.difficulty,
        calories: seed.calories,
      });
    }
  }
  return map;
}
