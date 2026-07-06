function parseJsonSafe(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;

  let current = value;
  for (let i = 0; i < 3; i++) {
    if (typeof current !== "string") break;
    const trimmed = current.trim();
    if (!trimmed || trimmed === "[]") return [];
    try {
      current = JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
  return current;
}

export function normalizeIngredients(items) {
  const parsed = parseJsonSafe(items);
  const list = Array.isArray(parsed) ? parsed : items ? [items] : [];
  if (!list.length) return [];

  return list
    .map((ing) => {
      if (typeof ing === "string") return ing.trim();
      if (!ing || typeof ing !== "object") return "";
      const qty = String(ing.quantity || "").trim();
      const name = String(ing.name || "").trim();
      if (qty && name) return `${qty} — ${name}`;
      return name || qty;
    })
    .filter(Boolean);
}

export function normalizeSteps(steps) {
  const parsed = parseJsonSafe(steps);
  if (Array.isArray(parsed)) {
    return parsed.map((s) => (typeof s === "string" ? s.trim() : String(s))).filter(Boolean);
  }
  if (typeof steps === "string") {
    const fromJson = parseJsonSafe(steps);
    if (Array.isArray(fromJson)) {
      return fromJson.map((s) => String(s).trim()).filter(Boolean);
    }
    return steps.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
