const FOOD_CORRECTIONS = {
  biryan: "biryani",
  briyani: "biryani",
  biriyani: "biryani",
  biriani: "biryani",
  beriyani: "biryani",
  chiken: "chicken",
  chciken: "chicken",
  chikcen: "chicken",
  psta: "pasta",
  pastaa: "pasta",
  spagetti: "spaghetti",
  spagheti: "spaghetti",
  pizz: "pizza",
  piza: "pizza",
  dosaa: "dosa",
  idly: "idli",
  idlee: "idli",
  paneer: "paneer",
  panner: "paneer",
  palak: "palak",
  curry: "curry",
  cury: "curry",
  kurry: "curry",
  noodles: "noodles",
  noddles: "noodles",
  noodls: "noodles",
  burger: "burger",
  burgr: "burger",
  sandwch: "sandwich",
  sandwitch: "sandwich",
  omlet: "omelette",
  omlette: "omelette",
  omlete: "omelette",
  soup: "soup",
  suop: "soup",
  salad: "salad",
  sald: "salad",
  rice: "rice",
  rise: "rice",
  fish: "fish",
  fsh: "fish",
  mutton: "mutton",
  muton: "mutton",
  egg: "egg",
  eg: "egg",
  tofu: "tofu",
  dhokla: "dhokla",
  dokla: "dhokla",
  paratha: "paratha",
  parata: "paratha",
  roti: "roti",
  naan: "naan",
  nan: "naan",
  kebab: "kebab",
  kabab: "kebab",
  tikka: "tikka",
  tika: "tikka",
  ramen: "ramen",
  sushi: "sushi",
  taco: "taco",
  steak: "steak",
  khichdi: "khichdi",
  khichri: "khichdi",
  samosa: "samosa",
  samossa: "samosa",
  chole: "chole",
  chana: "chana",
  dal: "dal",
  daal: "dal",
  lassi: "lassi",
  chaat: "chaat",
  chat: "chaat",
};

export function correctFoodSpelling(text = "") {
  if (!text?.trim()) return text;

  let result = text.toLowerCase();

  const sorted = Object.keys(FOOD_CORRECTIONS).sort((a, b) => b.length - a.length);
  for (const wrong of sorted) {
    const regex = new RegExp(`\\b${wrong}\\b`, "gi");
    result = result.replace(regex, FOOD_CORRECTIONS[wrong]);
  }

  return result.replace(/\s+/g, " ").trim();
}

export function correctIngredientList(ingredients = []) {
  return ingredients.map((ing) => correctFoodSpelling(String(ing)));
}
