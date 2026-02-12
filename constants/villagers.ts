/**
 * Static lists of Animal Crossing villager characteristics
 */

export const VILLAGER_PERSONALITIES = [
  "Big sister",
  "Cranky",
  "Jock",
  "Lazy",
  "Normal",
  "Peppy",
  "Smug",
  "Snooty",
] as const;

export const VILLAGER_SPECIES = [
  "Alligator",
  "Anteater",
  "Bear",
  "Bear cub",
  "Bird",
  "Bull",
  "Cat",
  "Chicken",
  "Cow",
  "Deer",
  "Dog",
  "Duck",
  "Eagle",
  "Elephant",
  "Frog",
  "Goat",
  "Gorilla",
  "Hamster",
  "Hippo",
  "Horse",
  "Kangaroo",
  "Koala",
  "Lion",
  "Monkey",
  "Mouse",
  "Octopus",
  "Ostrich",
  "Penguin",
  "Pig",
  "Rabbit",
  "Rhinoceros",
  "Sheep",
  "Squirrel",
  "Tiger",
  "Wolf",
] as const;

export const VILLAGER_SIGNS = [
  "Aquarius",
  "Aries",
  "Cancer",
  "Capricorn",
  "Gemini",
  "Leo",
  "Libra",
  "Pisces",
  "Sagittarius",
  "Scorpio",
  "Taurus",
  "Virgo",
] as const;

export type VillagerPersonality = typeof VILLAGER_PERSONALITIES[number];
export type VillagerSpecies = typeof VILLAGER_SPECIES[number];
export type VillagerSign = typeof VILLAGER_SIGNS[number];
