const DISH_IMAGES = {
  biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  "chicken biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  "mutton biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  "veg biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  butter: "https://images.unsplash.com/photo-1603894584373-5ac82b364de7?w=800&q=80",
  chicken: "https://images.unsplash.com/photo-1603894584373-5ac82b364de7?w=800&q=80",
  "butter chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b364de7?w=800&q=80",
  tikka: "https://images.unsplash.com/photo-1603894584373-5ac82b364de7?w=800&q=80",
  paneer: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  "palak paneer": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  pasta: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
  spaghetti: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
  alfredo: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
  pizza: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
  margherita: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  curry: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  dal: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  chole: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  dosa: "https://images.unsplash.com/photo-1630384060420-cbb20a2e6f2b?w=800&q=80",
  idli: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
  sambar: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
  fish: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80",
  rice: "https://images.unsplash.com/photo-160313387287-584f7f2a1e9d?w=800&q=80",
  "fried rice": "https://images.unsplash.com/photo-160313387287-584f7f2a1e9d?w=800&q=80",
  soup: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
  dessert: "https://images.unsplash.com/photo-1488477181941-781db1cb4d37?w=800&q=80",
  cake: "https://images.unsplash.com/photo-1488477181941-781db1cb4d37?w=800&q=80",
  pancake: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
  omelette: "https://images.unsplash.com/photo-1525351484163-752d941d3a58?w=800&q=80",
  egg: "https://images.unsplash.com/photo-1525351484163-752d941d3a58?w=800&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80",
  noodles: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
  manchurian: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80",
  tofu: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80",
  dhokla: "https://images.unsplash.com/photo-1606491956689-2ea866880f84?w=800&q=80",
  roti: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  naan: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  kebab: "https://images.unsplash.com/photo-1603894584373-5ac82b364de7?w=800&q=80",
  sushi: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80",
  ramen: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
  taco: "https://images.unsplash.com/photo-1565299585323-38174c4aab0e?w=800&q=80",
  steak: "https://images.unsplash.com/photo-1546837149-0c0c0c0c0c0c?w=800&q=80",
  smoothie: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  khichdi: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  paratha: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  lassi: "https://images.unsplash.com/photo-1488477181941-781db1cb4d37?w=800&q=80",
  chaat: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80",
  puri: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80",
  pav: "https://images.unsplash.com/photo-1606491956689-2ea866880f84?w=800&q=80",
};

const DEFAULT_FOOD = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";

export function getRecipeImage(title = "", searchTerm = "") {
  const combined = `${title} ${searchTerm}`.toLowerCase().trim();
  if (!combined) return DEFAULT_FOOD;

  const sortedKeys = Object.keys(DISH_IMAGES).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (combined.includes(key)) return DISH_IMAGES[key];
  }

  const words = combined.split(/\s+/).filter((w) => w.length > 3);
  for (const word of words) {
    if (DISH_IMAGES[word]) return DISH_IMAGES[word];
  }

  return DEFAULT_FOOD;
}
