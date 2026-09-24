import type { Allergen, BringCategory, Diet, FavoriteFood } from '../../api/client'

export const DIETS: Record<Diet, string> = {
  omnivore: 'Mangio di tutto',
  vegetarian: 'Vegetariana',
  vegan: 'Vegana',
  pescatarian: 'Pescetariana',
  no_pork: 'Senza maiale',
  halal: 'Halal',
  kosher: 'Kosher',
}

/** "Adatto a …" on a meal. No omnivore: every meal suits someone who eats everything. */
export const SUITABLE_FOR: Record<Exclude<Diet, 'omnivore'>, string> = {
  vegetarian: 'Vegetariani',
  vegan: 'Vegani',
  pescatarian: 'Pescetariani',
  no_pork: 'Chi non mangia maiale',
  halal: 'Halal',
  kosher: 'Kosher',
}

// The 14 allergens of EU Regulation 1169/2011
export const ALLERGENS: Record<Allergen, string> = {
  gluten: 'Glutine',
  crustaceans: 'Crostacei',
  eggs: 'Uova',
  fish: 'Pesce',
  peanuts: 'Arachidi',
  soy: 'Soia',
  milk: 'Latte e lattosio',
  tree_nuts: 'Frutta a guscio',
  celery: 'Sedano',
  mustard: 'Senape',
  sesame: 'Sesamo',
  sulphites: 'Solfiti',
  lupin: 'Lupini',
  molluscs: 'Molluschi',
}

export const FAVORITE_FOODS: Record<FavoriteFood, string> = {
  italian: 'Cucina italiana',
  homestyle: 'Cucina casalinga',
  mediterranean: 'Mediterranea',
  asian: 'Asiatica',
  japanese: 'Giapponese',
  indian: 'Indiana',
  mexican: 'Messicana',
  middle_eastern: 'Mediorientale',
  spicy: 'Piccante',
  seafood: 'Pesce e frutti di mare',
  meat: 'Carne',
  vegetarian_dishes: 'Piatti vegetariani',
  desserts: 'Dolci',
  street_food: 'Street food',
}

export const BRING_CATEGORIES: Record<BringCategory, string> = {
  drinks: 'Bevande',
  dessert: 'Dolce',
  starter: 'Antipasto',
  side: 'Contorno',
  bread: 'Pane',
  fruit: 'Frutta',
}

export function labelList<T extends string>(
  values: T[],
  labels: Partial<Record<T, string>>,
): string {
  return values.map((value) => labels[value] ?? value).join(', ')
}
